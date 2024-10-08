"use strict";
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllMessagesInAChat = exports.onCallMembersCount = exports.getFilesInChat = exports.getInitialFilesInChat = exports.getUsersInAChat = exports.leaveFromChat = exports.updateChatStatusAsBlockOrUnblock = exports.removeFromAdmin = exports.makeAdmin = exports.deleteSingleChat = exports.addToGroup = exports.removeFromGroup = exports.updateGroupNamePhoto = exports.createGroupChat = exports.fetchChats = exports.accessChat = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const ChatModel_1 = require("../model/ChatModel");
const UserModel_1 = require("../model/UserModel");
const MessageModel_1 = require("../model/MessageModel");
const mongoose_1 = __importDefault(require("mongoose"));
const random_avatar_generator_1 = require("random-avatar-generator");
const cloudinary_1 = require("cloudinary");
const __1 = require("..");
const groupSocket_1 = require("../common/groupSocket");
const functions_1 = require("./functions");
const generateUpdateMessage_1 = require("../common/generateUpdateMessage");
const checkIsOnline_1 = require("../common/checkIsOnline");
const processChatsWithUnseenCount_1 = require("../common/processChatsWithUnseenCount");
//@access          Protected
const accessChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return next(new errorHandler_1.CustomErrorHandler("Chat Id or content cannot be empty!", 400));
    }
    ///when use separate model for keep users reference for chat
    // const userChatExists = await UserChat.find({
    //   $or: [
    //     { userId: req.id, userId: userId },
    //     { userId: userId, userId: req.id },
    //   ],
    // }).populate("chatId");
    var isChat = yield ChatModel_1.Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users chatBlockedBy groupAdmin", "-password")
        .populate("latestMessage");
    isChat = yield UserModel_1.User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name image email lastActive createdAt",
    });
    //check if any user is online
    const isOnline = yield (0, checkIsOnline_1.checkIfAnyUserIsOnline)(isChat === null || isChat === void 0 ? void 0 : isChat.users, req.id);
    if (isChat.length > 0) {
        res.status(200).send({ chatData: Object.assign(Object.assign({}, isChat[0].toObject()), { isOnline }) });
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.id, userId],
        };
        try {
            const createdChat = yield ChatModel_1.Chat.create(chatData);
            let FullChat = yield ChatModel_1.Chat.findOne({ _id: createdChat._id }).populate("users", "name email image lastActive onlineStatus createdAt onlineStatus");
            const isOnline = yield (0, checkIsOnline_1.checkIfAnyUserIsOnline)(FullChat === null || FullChat === void 0 ? void 0 : FullChat.users, req.id);
            res.status(201).json({
                success: true,
                isNewChat: true,
                chatData: Object.assign(Object.assign({}, FullChat === null || FullChat === void 0 ? void 0 : FullChat.toObject()), { isOnline }),
            });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.accessChat = accessChat;
// //@fetchChats         Protected
//@fetchChats         Protected
const fetchChats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const searchQuery = req.query.search || '';
        // Construct the search keyword object
        const keyword = searchQuery
            ? {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                ],
            }
            : {};
        // Fetch unseen messages count for the user
        const unseenCount = yield unseenMessagesCounts(limit, skip, keyword, req.id);
        // Count the total documents matching the keyword for pagination
        const totalDocs = yield ChatModel_1.Chat.countDocuments({
            users: { $elemMatch: { $eq: req.id } },
        });
        // Find chats that the user is part of and match the search criteria
        let chats = yield ChatModel_1.Chat.find({
            users: { $elemMatch: { $eq: req.id } },
            $or: [
                { isGroupChat: true, chatName: { $regex: searchQuery, $options: "i" } },
                { isGroupChat: false },
            ],
        })
            .populate({
            path: "users",
            select: "name email image createdAt lastActive onlineStatus",
        })
            .populate("groupAdmin", "email name image createdAt lastActive onlineStatus")
            .populate("latestMessage")
            .populate("chatBlockedBy", "name image email createdAt lastActive onlineStatus")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip);
        // Populate sender details for the latest message
        chats = yield UserModel_1.User.populate(chats, {
            path: "latestMessage.sender",
            select: "name image email lastActive createdAt onlineStatus",
        });
        // Filter the chats based on the keyword in user name or email after populating
        let filteredChats = chats;
        if (searchQuery) {
            filteredChats = chats.filter((chat) => chat.users.some((user) => user.name.match(new RegExp(searchQuery, "i")) ||
                user.email.match(new RegExp(searchQuery, "i"))) || (chat.chatName && chat.chatName.match(new RegExp(searchQuery, "i"))));
        }
        // Process the chats and include unseen count and online status
        const processedChats = yield (0, processChatsWithUnseenCount_1.processChatsWithUnseenCount)(filteredChats, unseenCount, req.id);
        res.status(200).send({
            chats: processedChats || [],
            total: totalDocs,
            limit,
            unseenCountArray: unseenCount,
        });
    }
    catch (error) {
        console.error("Error fetching chats:", error);
        next(error);
    }
});
exports.fetchChats = fetchChats;
// export const fetchChats = async (
//   req: Request | any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // console.log({fetchChats:req.id})
//     const limit = parseInt(req.query.limit) || 10;
//     // const page = parseInt(req.query.page) || 1;
//     // const skip = (page - 1) * limit;
//     const skip = parseInt(req.query.skip) || 0;
//     const keyword: any = req.query.search
//       ? {
//           $or: [
//             { name: { $regex: req.query.search, $options: "i" } },
//             { email: { $regex: req.query.search, $options: "i" } },
//           ],
//         }
//       : {};
//     const unseenCount: any = await unseenMessagesCounts(limit, skip, keyword, req.id);
//     // Count the total documents matching the keyword
//     const totalDocs = await Chat.countDocuments({
//       users: { $elemMatch: { $eq: req.id } },
//     });
//     //when i use keep users in chat to separate document
//     //const totalDocs = await UserChat.countDocuments({ userId: req.id });
//     // Find user-chat association documents for the current user
//     // const userChats = await UserChat.find({ userId: req.id }).select("chatId");
//     // // Extract chat IDs from user-chat association documents
//     // const chatIds = userChats.map((userChat) => userChat.chatId);
//     // // Perform the query to find chat documents based on the extracted chat IDs
//     // const chats = await Chat.find({
//     //   $or: [
//     //     { _id: { $in: chatIds } }, // Find chats where the _id matches any of the extracted chat IDs
//     //     { chatName: { $regex: req.query.search, $options: "i" } },
//     //   ],
//     // });
//     // const user=await User.findById(req.id);
//     const chats = await Chat.find({
//       $and: [
//         { users: { $elemMatch: { $eq: req.id } } },
//         {
//           $or: [
//             {
//               $and: [
//                 { chatName: { $regex: req.query.search, $options: "i" } }, // Matching chatName
//                 { isGroupChat: true }, // When isGroupChat is true
//               ],
//             },
//             { isGroupChat: false }, // For non-group chats
//           ],
//         },
//       ],
//     })
//       .populate({
//         path: "users",
//         select: "name email image createdAt lastActive onlineStatus",
//         options: { limit: 10 }, // Set limit to Infinity to populate all documents
//       })
//       .populate("groupAdmin", "email name image createdAt lastActive onlineStatus")
//       .populate("latestMessage")
//       .populate("chatBlockedBy", "name image email createdAt lastActive onlineStatus")
//       .sort({ updatedAt: -1 })
//       .limit(limit)
//       .skip(skip);
//     const populatedChats = await User.populate(chats, {
//       path: "latestMessage.sender",
//       select: "name image email lastActive createdAt lastActive onlineStatus",
//     });
//     // Filter the populatedChats array based on the keyword
//     let filteredChats: any = [];
//     if (req.query.search && keyword) {
//       filteredChats = populatedChats.filter(
//         (chat: any) =>
//           chat.users.some(
//             (user: any) =>
//               user.name.match(new RegExp(keyword.$or[0].name.$regex, "i")) ||
//               user.email.match(new RegExp(keyword.$or[1].email.$regex, "i"))
//           ) || chat.chatName.match(new RegExp(req.query.search, "i")) // Add chatName filtering condition
//       );
//     }
// //send response
//    const chatsToSend = filteredChats.length > 0 ? filteredChats : populatedChats;
//    const processedChats = await processChatsWithUnseenCount(
//      chatsToSend,
//      unseenCount,
//      req.id
//    );
//    res.status(200).send({
//      chats: processedChats||[],
//      total: totalDocs,
//      limit,
//      unseenCountArray: unseenCount,
//    });
//   } catch (error: any) {
//     console.log(error);
//     next(error);
//   }
// };
//unseenMessagesCounts for every single chat
const unseenMessagesCounts = (limit, skip, keyword, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unseenCount = yield ChatModel_1.Chat.aggregate([
            {
                $match: {
                    users: { $elemMatch: { $eq: new mongoose_1.default.Types.ObjectId(userId) } },
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "chat",
                    as: "messages",
                },
            },
            {
                $unwind: "$messages",
            },
            {
                $match: keyword,
            },
            {
                $group: {
                    _id: "$_id",
                    unseenMessagesCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$messages.sender", new mongoose_1.default.Types.ObjectId(userId)] },
                                        { $in: ["$messages.status", ["unseen", "delivered"]] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
        return unseenCount;
    }
    catch (error) { }
});
//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.users || !req.body.groupName) {
        return next(new errorHandler_1.CustomErrorHandler("GroupName or users cannot be empty!", 400));
    }
    var users = req.body.users;
    if (users.length < 2) {
        return next(new errorHandler_1.CustomErrorHandler("more than 2 users are required to form a group chat!", 400));
    }
    users.push(req.id);
    try {
        const generator = new random_avatar_generator_1.AvatarGenerator();
        const randomAvatarUrl = generator.generateRandomAvatar();
        const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(randomAvatarUrl, {
            folder: "Chatiaa",
            format: "png", // Specify the format as PNG
        });
        const groupChat = yield ChatModel_1.Chat.create({
            chatName: req.body.groupName,
            users: users,
            image: {
                url: cloudinaryResponse.secure_url,
                public_id: cloudinaryResponse.public_id,
            },
            isGroupChat: true,
            groupAdmin: req.id,
        });
        //
        // Create user-chat associations for each user
        // await Promise.all(
        //   users.map(async (userId: string) => {
        //     // Check if the user exists
        //     const userExists = await User.exists({ _id: userId });
        //     if (!userExists) {
        //       throw new CustomErrorHandler(`User with ID ${userId} does not exist`, 404);
        //     }
        //     // Create the user-chat association document
        //     await UserChat.create({
        //       chatId: groupChat._id,
        //       userId: userId,
        //     });
        //   })
        // );
        const fullGroupChat = yield ChatModel_1.Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.createGroupChat = createGroupChat;
// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
//
// @access  Protected updateGroupPhoto and name
const updateGroupNamePhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { chatId, groupName, description } = req.body;
        const foundChat = yield ChatModel_1.Chat.findById(chatId);
        const currentUser = yield UserModel_1.User.findById(req.id);
        if (!currentUser) {
            return next(new errorHandler_1.CustomErrorHandler("User not found!", 404));
        }
        if (!foundChat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        // Update chat image if req.file.path exists
        let imageUpdate = {};
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            // Check if chat.image exists, if so, remove the previous image from cloudinary
            if (foundChat.image && foundChat.image.public_id) {
                yield cloudinary_1.v2.uploader.destroy(foundChat.image.public_id);
            }
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path, {
                folder: "Chatiaa",
            });
            imageUpdate = {
                image: {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url,
                },
            };
        }
        // Update chat name and description if provided
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, Object.assign(Object.assign({}, imageUpdate), { chatName: groupName || foundChat.chatName, description: description || foundChat.description }), {
            new: true,
        })
            .populate({
            path: "users",
            select: "name email image lastActive onlineStatus onlineStatus",
            options: { limit: 10 },
        })
            .populate("groupAdmin", "name email image lastActive onlineStatus onlineStatus");
        // //@@@ notify/emit-socket group members that who updated the group
        // Generate update message
        const message = (0, generateUpdateMessage_1.generateUpdateMessage)(currentUser, description, groupName, (_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        if (message.trim() !== "") {
            const updateGroupMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                chatId: chatId,
                user: currentUser,
                message,
            });
            const updateGroupData = {
                message: Object.assign({}, updateGroupMessage.toObject()),
                chatId,
            };
            yield (0, groupSocket_1.emitEventToGroupUsers)(__1.io, "groupNotifyReceived", chatId, updateGroupData);
        }
        //@@@ notify/emit socket group members that who updated the group
        res.json(updatedChat);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.updateGroupNamePhoto = updateGroupNamePhoto;
// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove or leave user when leave user reassign new random admin
// @access  Protected
const removeFromGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { chatId, userId } = req.body;
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const removedUser = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $pull: { users: userId, groupAdmin: userId },
        }, {
            new: true,
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        if (!removedUser) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        // Check if the removed user is in the groupAdmin array
        const isAdminLeave = removedUser.groupAdmin.some((adminId) => adminId.equals(userId));
        if (isAdminLeave) {
            // If the removed user was in the groupAdmin array, update the groupAdmin array
            const newGroupAdmins = removedUser.groupAdmin.filter((adminId) => !adminId.equals(userId));
            if (newGroupAdmins.length === 0) {
                // If no admins are left, select a random user as the new admin
                const randomUser = removedUser.users[Math.floor(Math.random() * removedUser.users.length)];
                if (randomUser) {
                    newGroupAdmins.push(randomUser._id);
                }
                else {
                    // If no random user is found, make the first user in the list the admin
                    newGroupAdmins.push((_c = removedUser.users[0]) === null || _c === void 0 ? void 0 : _c._id);
                }
            }
            // Update the groupAdmin field with the new admins
            yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
                groupAdmin: newGroupAdmins,
            }, {
                new: true,
            });
            // Send response to the user when admin leaves
            // Check if all users have left the chat after admin leaves
            if (removedUser.users.length === 0) {
                yield ChatModel_1.Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
            }
            res.json({ isAdminLeave: true, data: removedUser });
            return; // Return to prevent the execution of the rest of the code
        }
        // Check if all users have left the chat, and if so, delete the chat
        if (removedUser.users.length === 0) {
            yield ChatModel_1.Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
        }
        res.json({ data: removedUser });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromGroup = removeFromGroup;
// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userIds } = req.body;
        //
        const currentUser = yield UserModel_1.User.findById(req.id);
        // Check if the chat exists
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const newUsers = [];
        // Loop through userIds and add users who are not already members
        for (const userId of userIds) {
            if (!chat.users.includes(userId)) {
                newUsers.push(userId);
            }
        }
        // If all users are already members, return a message
        if (newUsers.length === 0) {
            return res
                .status(400)
                .json({ message: "All users are already members of the group" });
        }
        // Add new users to the group
        const added = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $push: { users: { $each: newUsers } },
        }, {
            new: true,
        })
            .populate({
            path: "users",
            select: "name email image lastActive onlineStatus",
            options: { limit: 10 },
        })
            .populate("groupAdmin", "name email image lastActive onlineStatus");
        if (!added) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        else {
            //@@@ notify group members that who added in group
            for (const userId of userIds) {
                const user = yield UserModel_1.User.findById(userId);
                const addUsersToGroupMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: chatId,
                    user: currentUser,
                    message: `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.name} added ${user === null || user === void 0 ? void 0 : user.name} to the group `,
                });
                const addUsersToGroupData = {
                    message: Object.assign({}, addUsersToGroupMessage.toObject()),
                    user,
                    chatId,
                };
                yield (0, groupSocket_1.emitEventToGroupUsers)(__1.io, "groupNotifyReceived", chatId, addUsersToGroupData);
                //@@@ notify group members that who added in group
            }
            res.json(added);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.addToGroup = addToGroup;
//delete single chat one to one chat
const deleteSingleChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (!req.params.chatId || !req.id) {
            return next(new errorHandler_1.CustomErrorHandler("ChatId Not found", 400));
        }
        const chat = yield ChatModel_1.Chat.findById(req.params.chatId);
        yield MessageModel_1.Message.deleteMany({ chat: req.params.chatId });
        yield ChatModel_1.Chat.findByIdAndDelete(req.params.chatId);
        res.json({
            success: true,
            chat: chat,
            receiverId: (_d = chat === null || chat === void 0 ? void 0 : chat.users.find((user) => user.toString() !== req.id)) === null || _d === void 0 ? void 0 : _d._id.toString(),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSingleChat = deleteSingleChat;
///make admin
const makeAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));
        if (!isAdmin) {
            return next(new errorHandler_1.CustomErrorHandler("You are not the group admin!", 403));
        }
        // Check if userId is already an admin
        const isAlreadyAdmin = chat.groupAdmin.some((adminId) => adminId.equals(userId));
        if (isAlreadyAdmin) {
            return res.json({ message: "User is already an admin.", data: chat });
        }
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $addToSet: { groupAdmin: userId },
        }, {
            new: true,
        })
            .populate({
            path: "users",
            select: "name email image lastActive onlineStatus",
            options: { limit: 10 },
        })
            .populate("groupAdmin", "name email image lastActive onlineStatus");
        if (!updatedChat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        res.json({ data: updatedChat });
    }
    catch (error) {
        next(error);
    }
});
exports.makeAdmin = makeAdmin;
//remove from group admin
const removeFromAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));
        if (!isAdmin) {
            return next(new errorHandler_1.CustomErrorHandler("You are not the group admin!", 403));
        }
        // Remove the user from the groupAdmin array
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $pull: { groupAdmin: userId },
        }, {
            new: true,
        });
        if (!updatedChat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        // Check if there are no remaining admins
        if (updatedChat.groupAdmin.length === 0) {
            // Select two random users from the chat's users array, excluding the leaving admin
            const usersCount = updatedChat.users.length;
            const leavingAdminIndex = updatedChat.users.findIndex((user) => user._id.equals(userId));
            const randomAdmins = [];
            if (usersCount > 0) {
                // Select two random users as admins, excluding the leaving admin
                for (let i = 0; i < 2; i++) {
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * usersCount);
                    } while (randomIndex === leavingAdminIndex); // Ensure the leaving admin is not selected
                    randomAdmins.push(updatedChat.users[randomIndex]._id);
                }
            }
            // Update the groupAdmin field with the new admins
            yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
                $addToSet: { groupAdmin: { $each: randomAdmins } },
            }, {
                new: true,
            });
            // Send response indicating new group admins
            res.json({ newGroupAdmins: randomAdmins, data: updatedChat });
            return;
        }
        // Send response indicating successful removal
        res.json({ data: updatedChat });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromAdmin = removeFromAdmin;
//update Chat status as Blocked/Unblocked
const updateChatStatusAsBlockOrUnblock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const { chatId, status } = req.body;
        if (!status || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("chat Id or status cannot be empty!", 400));
        let updateQuery = {};
        if (status === "block") {
            updateQuery = {
                $addToSet: {
                    chatBlockedBy: req.id,
                },
            };
        }
        else if (status === "unblock") {
            updateQuery = {
                $pull: {
                    chatBlockedBy: req.id,
                },
            };
        }
        else {
            return next(new errorHandler_1.CustomErrorHandler("Invalid status!", 400));
        }
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, updateQuery, {
            new: true,
        }).populate("chatBlockedBy");
        res.status(200).json({
            chat: updatedChat,
            chatId: updatedChat === null || updatedChat === void 0 ? void 0 : updatedChat._id,
            receiverId: (_e = updatedChat === null || updatedChat === void 0 ? void 0 : updatedChat.users.find((user) => user.toString() !== req.id)) === null || _e === void 0 ? void 0 : _e._id.toString(),
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatStatusAsBlockOrUnblock = updateChatStatusAsBlockOrUnblock;
//LeaveChat
const leaveFromChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $pull: { users: userId },
        }, {
            new: true,
        });
        if (!updatedChat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        res.json({ chat: updatedChat, userId });
    }
    catch (error) {
        next(error);
    }
});
exports.leaveFromChat = leaveFromChat;
//get users in a chat
const getUsersInAChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const search = req.query.search;
    try {
        const chat = yield ChatModel_1.Chat.findById({ _id: req.params.chatId });
        let findChatQuery = yield ChatModel_1.Chat.findOne({ _id: req.params.chatId }).populate({
            path: "users",
            select: "-password",
            match: {
                $or: [
                    { name: { $regex: new RegExp(search, "i") } },
                    { email: { $regex: new RegExp(search, "i") } },
                ],
            },
            options: { limit, skip },
        });
        const total = chat ? chat.users.length : 0;
        // Check online status for each user
        const usersWithOnlineStatus = yield Promise.all(((findChatQuery === null || findChatQuery === void 0 ? void 0 : findChatQuery.users) || []).map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const isOnline = yield UserModel_1.User.findOne({
                _id: user === null || user === void 0 ? void 0 : user._id,
                onlineStatus: { $in: ["online", "busy"] },
            });
            return Object.assign(Object.assign({}, user.toObject()), { isOnline: !!isOnline, onlineStatus: isOnline === null || isOnline === void 0 ? void 0 : isOnline.onlineStatus });
        })));
        res.send({ users: usersWithOnlineStatus, total, limit });
    }
    catch (error) {
        next(error);
    }
});
exports.getUsersInAChat = getUsersInAChat;
//find inital files from a chat
const getInitialFilesInChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield MessageModel_1.Message.find({
            chat: req.params.chatId,
            type: "image",
        })
            .select("file") // Select only the 'file' field
            .sort({ updatedAt: -1 })
            .limit(5);
        const total = yield MessageModel_1.Message.countDocuments({
            type: { $in: ["image", "application", "audio", "video"] },
        });
        res.send({ files, total });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.getInitialFilesInChat = getInitialFilesInChat;
//find files from a chat
const getFilesInChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const filter = req.query.filter;
    try {
        const query = {
            chat: req.params.chatId,
        };
        if (filter === "all") {
            query.type = { $in: ["image", "application", "audio", "video"] };
        }
        else {
            query.type = filter;
        }
        const files = yield MessageModel_1.Message.find(query)
            .sort({ updatedAt: -1 })
            .select("file type")
            .populate("sender", "image name email createdAt")
            .limit(limit)
            .skip(skip);
        const total = yield MessageModel_1.Message.countDocuments(query);
        const totalImages = yield MessageModel_1.Message.countDocuments({
            chat: req.params.chatId,
            type: "image",
        });
        const totalAudios = yield MessageModel_1.Message.countDocuments({
            chat: req.params.chatId,
            type: "audio",
        });
        const totalVideos = yield MessageModel_1.Message.countDocuments({
            chat: req.params.chatId,
            type: "video",
        });
        const totalDocuments = yield MessageModel_1.Message.countDocuments({
            chat: req.params.chatId,
            type: "application",
        });
        res.send({
            files,
            total,
            limit,
            totalImages,
            totalAudios,
            totalVideos,
            totalDocuments,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFilesInChat = getFilesInChat;
//update oncallmembers count
//onCallMembersCount
const onCallMembersCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield ChatModel_1.Chat.findById(req.body.chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        // Update onCallMembers count based on join or leave action
        // Update onCallMembers count based on join or leave action
        if (req.body.type === "join") {
            chat.onCallMembers += 1;
        }
        else {
            // Ensure not to decrease onCallMembers below 0
            chat.onCallMembers = Math.max(chat.onCallMembers - 1, 0);
        }
        // Save the updated chat object
        yield chat.save();
        res.send({ chat });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.onCallMembersCount = onCallMembersCount;
//deleteAllMessagesInACh
const deleteAllMessagesInAChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const chat = yield ChatModel_1.Chat.findOne({
            _id: chatId,
            users: { $elemMatch: { $eq: req.id } },
        });
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        // Find all messages in the chat that have a file attached
        const messagesWithFiles = yield MessageModel_1.Message.find({
            chat: chatId,
            "file.public_Id": { $exists: true },
        });
        // Delete files from cloud storage and collect public_ids
        const publicIds = messagesWithFiles.map((message) => { var _a; return (_a = message === null || message === void 0 ? void 0 : message.file) === null || _a === void 0 ? void 0 : _a.public_id; });
        yield Promise.all(publicIds.map((public_id) => cloudinary_1.v2.uploader.destroy(public_id)));
        yield MessageModel_1.Message.deleteMany({ chat: chatId });
        res.json({
            success: true,
            message: "All Messages are deleted!",
            chatId,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteAllMessagesInAChat = deleteAllMessagesInAChat;
