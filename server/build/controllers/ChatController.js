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
exports.leaveFromChat = exports.updateChatStatusAsBlockOrUnblock = exports.removeFromAdmin = exports.makeAdmin = exports.deleteSingleChat = exports.addToGroup = exports.removeFromGroup = exports.renameGroup = exports.createGroupChat = exports.fetchChats = exports.accessChat = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const ChatModel_1 = require("../model/ChatModel");
const UserModel_1 = require("../model/UserModel");
const MessageModel_1 = require("../model/MessageModel");
const mongoose_1 = __importDefault(require("mongoose"));
//@access          Protected
const accessChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return next(new errorHandler_1.CustomErrorHandler("Chat Id or content cannot be empty!", 400));
    }
    var isChat = yield ChatModel_1.Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");
    isChat = yield UserModel_1.User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name image email lastActive",
    });
    if (isChat.length > 0) {
        res.status(200).send({ chatData: isChat[0] });
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.id, userId],
        };
        try {
            const createdChat = yield ChatModel_1.Chat.create(chatData);
            let FullChat = yield ChatModel_1.Chat.findOne({ _id: createdChat._id }).populate("users", "name email image lastActive");
            res.status(201).json({ success: true, isNewChat: true, chatData: FullChat });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.accessChat = accessChat;
const fetchChats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        const unseenCount = yield unseenMessagesCounts(limit, skip, keyword, req.id);
        // console.log({unseenCount})
        // Count the total documents matching the keyword
        const totalDocs = yield ChatModel_1.Chat.countDocuments({
            users: { $elemMatch: { $eq: req.id } },
        });
        const chats = yield ChatModel_1.Chat.find({
            users: { $elemMatch: { $eq: req.id } },
        })
            .populate("users", "-password")
            .populate("groupAdmin", "email name image")
            .populate("latestMessage")
            .populate("chatBlockedBy", "name image email")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip);
        const populatedChats = yield UserModel_1.User.populate(chats, {
            path: "latestMessage.sender",
            select: "name image email lastActive ",
        });
        // Filter the populatedChats array based on the keyword
        let filteredChats = [];
        if (req.query.search && keyword) {
            filteredChats = populatedChats.filter((chat) => chat.users.some((user) => user.name.match(new RegExp(keyword.$or[0].name.$regex, "i")) ||
                user.email.match(new RegExp(keyword.$or[1].email.$regex, "i"))));
        }
        const filteredChatsWithUnseenCount = filteredChats.map((chat) => {
            const correspondingUnseenCount = unseenCount.find((count) => count._id.toString() === chat._id.toString());
            return Object.assign(Object.assign({}, chat.toObject()), { unseenCount: correspondingUnseenCount
                    ? correspondingUnseenCount.unseenMessagesCount
                    : 0 });
        });
        // Modify populatedChats to include unseenCount for each chat
        const populatedChatsWithUnseenCount = populatedChats.map((chat) => {
            const correspondingUnseenCount = unseenCount.find((count) => count._id.toString() === chat._id.toString());
            return Object.assign(Object.assign({}, chat.toObject()), { unseenCount: correspondingUnseenCount
                    ? correspondingUnseenCount.unseenMessagesCount
                    : 0 });
        });
        res.status(200).send({
            chats: filteredChats.length > 0
                ? filteredChatsWithUnseenCount
                : req.query.search
                    ? []
                    : populatedChatsWithUnseenCount,
            total: filteredChats.length > 0
                ? filteredChats.length
                : req.query.search
                    ? 0
                    : totalDocs,
            limit,
            unseenCountArray: unseenCount,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.fetchChats = fetchChats;
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
        const groupChat = yield ChatModel_1.Chat.create({
            chatName: req.body.groupName,
            users: users,
            isGroupChat: true,
            groupAdmin: req.id,
        });
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
const renameGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            chatName: chatName,
        }, {
            new: true,
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        if (!updatedChat) {
            res.status(404);
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        else {
            res.json(updatedChat);
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.renameGroup = renameGroup;
// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove or leave user when leave user reassign new random admin
// @access  Protected
const removeFromGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { chatId, userId } = req.body;
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));
        // if (!isAdmin) {
        //   return next(new CustomErrorHandler("You are not the group admin!", 403));
        // }
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
            console.log("An admin leaves the group");
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
                    newGroupAdmins.push((_a = removedUser.users[0]) === null || _a === void 0 ? void 0 : _a._id);
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
                console.log("Chat Deleted!");
            }
            res.json({ isAdminLeave: true, data: removedUser });
            return; // Return to prevent the execution of the rest of the code
        }
        // Check if all users have left the chat, and if so, delete the chat
        if (removedUser.users.length === 0) {
            yield ChatModel_1.Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
            console.log("Chat Deleted!");
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
        const { chatId, userId } = req.body;
        // check if the requester is admin
        const added = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $push: { users: userId },
        }, {
            new: true,
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        if (!added) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        else {
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
    var _b;
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
            receiverId: (_b = chat === null || chat === void 0 ? void 0 : chat.users.find((user) => user.toString() !== req.id)) === null || _b === void 0 ? void 0 : _b._id.toString(),
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
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
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
//removeFromAdmin
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
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            $pull: { groupAdmin: userId },
        }, {
            new: true,
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        if (!updatedChat) {
            return next(new errorHandler_1.CustomErrorHandler("Chat not found!", 404));
        }
        res.json({ data: updatedChat });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromAdmin = removeFromAdmin;
//update Chat status as Blocked/Unblocked
const updateChatStatusAsBlockOrUnblock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
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
            receiverId: (_c = updatedChat === null || updatedChat === void 0 ? void 0 : updatedChat.users.find((user) => user.toString() !== req.id)) === null || _c === void 0 ? void 0 : _c._id.toString(),
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
