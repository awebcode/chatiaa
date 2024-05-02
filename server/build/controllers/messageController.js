"use strict";
//@description     Get all Messages
//@route           GET /api/Message/:chatId
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
exports.addRemoveEmojiReactions = exports.editMessage = exports.replyMessage = exports.updateMessageStatusAsUnsent = exports.updateMessageStatusAsRemove = exports.updateChatMessageAsDeliveredController = exports.updateAllMessageStatusSeen = exports.updateChatMessageController = exports.sendMessage = exports.getMessageReactions = exports.countReactionsGroupForMessage = exports.allMessages = void 0;
const MessageModel_1 = require("../model/MessageModel");
const UserModel_1 = require("../model/UserModel");
const ChatModel_1 = require("../model/ChatModel");
const errorHandler_1 = require("../middlewares/errorHandler");
const reactModal_1 = require("../model/reactModal");
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../index");
const functions_1 = require("./functions");
const seenByModel_1 = require("../model/seenByModel");
const groupSocket_1 = require("../common/groupSocket");
//@access          Protected
const allMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        // const skip = (page - 1) * limit;
        const skip = parseInt(req.query.skip) || 0;
        let messages = yield MessageModel_1.Message.find({ chat: req.params.chatId })
            .populate([
            {
                path: "isReply.messageId",
                select: "content file type",
                populate: {
                    path: "sender",
                    select: "name image email lastActive createdAt onlineStatus",
                },
            },
            {
                path: "isReply.repliedBy",
                select: "name image email lastActive createdAt onlineStatus",
            },
            {
                path: "isEdit.messageId",
                select: "content file type",
                populate: {
                    path: "sender",
                    select: "name image email lastActive createdAt onlineStatus",
                },
            },
            {
                path: "isEdit.editedBy",
                select: "name image email lastActive createdAt onlineStatus",
            },
        ])
            .populate("sender removedBy unsentBy", "name image email lastActive createdAt onlineStatus")
            .populate("chat")
            .sort({ _id: -1 })
            .limit(limit)
            .skip(skip);
        // .sort({ _id: -1 }) // Use _id for sorting in descending order
        messages = yield UserModel_1.User.populate(messages, {
            path: "sender chat.users",
            select: "name image email lastActive createdAt onlineStatus",
        });
        // Populate reactions for each message
        messages = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            const { reactionsGroup, totalReactions } = yield (0, exports.countReactionsGroupForMessage)(message._id);
            const reactions = yield reactModal_1.Reaction.find({ messageId: message._id })
                .populate({
                path: "reactBy",
                select: "name image email lastActive createdAt onlineStatus",
                options: { limit: 10 },
            })
                .sort({ updatedAt: -1 })
                .exec();
            //seenBy
            const seenBy = yield seenByModel_1.MessageSeenBy.find({ messageId: message._id })
                .populate({
                path: "userId",
                select: "name image email lastActive createdAt onlineStatus",
                options: { limit: 10 },
            })
                .sort({ updatedAt: -1 })
                .exec();
            //total seen by
            const totalseenBy = yield seenByModel_1.MessageSeenBy.countDocuments({
                messageId: message._id,
            });
            return Object.assign(Object.assign({}, message.toObject()), { reactions,
                reactionsGroup,
                totalReactions, seenBy: seenBy, totalseenBy });
        })));
        //find reactions here and pass with every message
        //@
        const total = yield MessageModel_1.Message.countDocuments({ chat: req.params.chatId });
        res.json({ messages, total, limit, page, skip });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.allMessages = allMessages;
// Count the number of reactions for a specific message
const countReactionsGroupForMessage = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reactionsGroup = yield reactModal_1.Reaction.aggregate([
            { $match: { messageId: new mongoose_1.default.Types.ObjectId(messageId) } }, // Match reactions for the given message ID
            { $group: { _id: "$emoji", count: { $sum: 1 } } }, // Group reactions by emoji and count
            { $sort: { count: -1 } }, // Sort by count in descending order
            // { $limit: 4 }, // Limit to top 4 groups
        ]);
        const totalReactions = yield reactModal_1.Reaction.countDocuments({ messageId });
        return { reactionsGroup, totalReactions };
    }
    catch (error) {
        console.error("Error counting reactions:", error);
        throw error; // Forward error to the caller
    }
});
exports.countReactionsGroupForMessage = countReactionsGroupForMessage;
// //get reaction base on message id while scroll and filter
// export const getMessageReactions = async (
//   req: Request | any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { messageId } = req.params;
//     const limit = parseInt(req.query.limit) || 10;
//     const page = parseInt(req.query.page) || 1;
//     const skip = (page - 1) * limit;
//     const reactions = await Reaction.find(
//       req.query.emoji === "all" || req.query.emoji === ""
//         ? {
//             messageId,
//           }
//         : { messageId, emoji: req.query.emoji }
//     )
//       .populate({
//         path: "reactBy",
//         select: "name image email lastActive createdAt onlineStatus",
//       })
//       .sort({ updatedAt: -1, reactBy: req.id })
//       .limit(limit)
//       .skip(skip)
//       .exec();
//     res.json(reactions);
//   } catch (error) {
//     console.error("Error getting message reactions:", error);
//     next(error);
//   }
// };
const getMessageReactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        // Define the aggregation pipeline
        const pipeline = [
            // Match reactions for the specific messageId and optionally for a specific emoji
            {
                $match: Object.assign({ messageId }, (req.query.emoji && req.query.emoji !== "all" && { emoji: req.query.emoji })),
            },
            // Sort by whether the user reacted or not
            {
                $addFields: {
                    reactedByCurrentUser: { $eq: ["$reactBy", req.id] },
                },
            },
            {
                $sort: {
                    reactedByCurrentUser: -1, // Sort descending, so the reactions by current user appear first
                },
            },
            // Perform a left outer join with the 'reactBy' collection to get user details
            {
                $lookup: {
                    from: "reactBy",
                    localField: "reactBy",
                    foreignField: "_id",
                    as: "reactByDetails",
                },
            },
            // Limit and skip for pagination
            { $skip: skip },
            { $limit: limit },
        ];
        // Execute the aggregation pipeline
        const reactions = yield reactModal_1.Reaction.aggregate(pipeline);
        res.json(reactions);
    }
    catch (error) {
        console.error("Error getting message reactions:", error);
        next(error);
    }
});
exports.getMessageReactions = getMessageReactions;
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId, type, receiverId } = req.body;
    if (!chatId) {
        return next(new errorHandler_1.CustomErrorHandler("Chat Id cannot be empty!", 400));
    }
    try {
        if (type === "file") {
            const fileUploadPromises = req.files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
                const fileType = yield (0, functions_1.getFileType)(file);
                const url = yield cloudinary_1.v2.uploader.upload(file.path, {
                    resource_type: "raw",
                    folder: "Chatiaa_2024",
                    format: file.mimetype === "image/svg+xml" ? "png" : "",
                });
                const localFilePath = file.path;
                fs_1.default.unlink(localFilePath, (err) => {
                    if (err) {
                        console.error(`Error deleting local file: ${err.message}`);
                    }
                    else {
                        //  console.log(`Local file deleted: ${localFilePath}`);
                    }
                });
                //temporary messageid for update user ui instantly
                const tempMessageId = typeof req.body.tempMessageId === "string"
                    ? req.body.tempMessageId
                    : req.body.tempMessageId[index];
                const newFileMessage = {
                    sender: req.id,
                    file: { public_Id: url.public_id, url: url.url },
                    chat: chatId,
                    type: file.mimetype === "audio/mp3"
                        ? "audio"
                        : file.mimetype === "image/svg+xml"
                            ? "image"
                            : fileType,
                    tempMessageId,
                };
                // Create and populate message
                let message = yield MessageModel_1.Message.create(newFileMessage);
                message = yield message.populate("sender chat", "name email image");
                message = yield UserModel_1.User.populate(message, {
                    path: "sender chat.users",
                    select: "name image email lastActive createdAt onlineStatus",
                });
                // Update latest message for the chat
                const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: message });
                // Send message to client
                const emitData = message.toObject();
                if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "receiveMessage", chatId, Object.assign({}, emitData));
                }
                else {
                    index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                        .to(receiverId)
                        .emit("receiveMessage", Object.assign(Object.assign({}, emitData), { receiverId }));
                }
                return message;
            }));
            // Wait for all file uploads to complete
            yield Promise.all(fileUploadPromises);
            res.status(200).json({ message: "File send sucessfully" });
        }
        else {
            const newMessage = {
                sender: req.id,
                content: content,
                chat: chatId,
            };
            // Create and populate message
            let message = yield MessageModel_1.Message.create(newMessage);
            message = yield message.populate("sender chat", "name image email lastActive createdAt onlineStatus");
            message = yield message.populate("chat");
            message = yield UserModel_1.User.populate(message, {
                path: "chat.users",
                select: "name image email lastActive createdAt onlineStatus",
            });
            // Update latest message for the chat
            const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: message });
            if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                const emitData = message.toObject();
                yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "receiveMessage", chatId, emitData);
            }
            else {
                index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                    .to(receiverId)
                    .emit("receiveMessage", Object.assign(Object.assign({}, message), { receiverId }));
            }
            res.status(200).json({ message: "File send sucessfully" });
            // Send message to client
        }
        // res.json(message);
    }
    catch (error) {
        next(error);
    }
});
exports.sendMessage = sendMessage;
//update message status
const updateChatMessageController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { chatId, status } = req.body;
        if (!status || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("Chat Id or status cannot be empty!", 400));
        const chat = yield ((_a = ChatModel_1.Chat.findById(chatId)) === null || _a === void 0 ? void 0 : _a.populate("latestMessage"));
        if (!chat || !chat.latestMessage) {
            return next(new errorHandler_1.CustomErrorHandler("Chat or latest message not found", 404));
        }
        const updateMessage = yield MessageModel_1.Message.findOneAndUpdate({
            $or: [
                { _id: (_b = chat.latestMessage) === null || _b === void 0 ? void 0 : _b._id },
                { tempMessageId: (_c = chat.latestMessage) === null || _c === void 0 ? void 0 : _c.tempMessageId },
            ],
        }, { status }, { new: true });
        const updateChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            latestMessage: updateMessage === null || updateMessage === void 0 ? void 0 : updateMessage._id,
        })
            .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name email image onlineStatus lastActive createdAt",
            },
        })
            .populate("users", "name email image onlineStatus lastActive createdAt");
        res.status(200).json({ success: true, chat: updateChat });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatMessageController = updateChatMessageController;
//update all messages status as seen
const updateAllMessageStatusSeen = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h;
    try {
        if (!req.params.chatId)
            return next(new errorHandler_1.CustomErrorHandler("Chat Id  cannot be empty!", 400));
        const lastMessage = yield ChatModel_1.Chat.findById(req.params.chatId).populate("latestMessage");
        if (((_e = (_d = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _d === void 0 ? void 0 : _d.sender) === null || _e === void 0 ? void 0 : _e.toString()) === req.id) {
            return;
        }
        yield ChatModel_1.Chat.findByIdAndUpdate(req.params.chatId, {
            latestMessage: (_f = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _f === void 0 ? void 0 : _f._id,
        });
        const updatedMessage = yield MessageModel_1.Message.find({
            $or: [{ chat: (_g = req.params) === null || _g === void 0 ? void 0 : _g.chatId }, { tempMessageId: (_h = req.params) === null || _h === void 0 ? void 0 : _h.tempMessageId }],
        }, {
            status: { $in: ["unseen", "delivered"] },
            // sender: { $ne: req.id }
        }).updateMany({
            status: "seen",
        });
        res.status(200).json(updatedMessage);
    }
    catch (error) {
        next(error);
    }
});
exports.updateAllMessageStatusSeen = updateAllMessageStatusSeen;
//update all message status as delivered after reconnect/rejoin/login a user
const updateChatMessageAsDeliveredController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId || userId === "undefined") {
            // return next(new CustomErrorHandler("User Id cannot be empty!", 400));
            return res.json({});
        }
        // Find all chats where the user is a participant
        const chats = yield ChatModel_1.Chat.find({ users: { $in: [userId] } }).populate("latestMessage");
        if (!chats || chats.length === 0) {
            // console.log("hi")
            //  return next(new CustomErrorHandler("No chats found for the user", 404));
            return res.json({});
        }
        // Update all messages in each chat
        const updatePromises = chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            var _j, _k, _l, _m, _o, _p;
            if (!chat.latestMessage) {
                return; // Skip chats without a latest message
            }
            // Update the latest message's status to "delivered"
            if (((_j = chat.latestMessage) === null || _j === void 0 ? void 0 : _j.status) === "unseen" &&
                ((_k = chat.latestMessage) === null || _k === void 0 ? void 0 : _k.sender.toString()) !== req.id) {
                yield MessageModel_1.Message.findOneAndUpdate({
                    $or: [
                        { _id: (_l = chat.latestMessage) === null || _l === void 0 ? void 0 : _l._id },
                        { tempMessageId: (_m = chat.latestMessage) === null || _m === void 0 ? void 0 : _m.tempMessageId },
                    ],
                }, { status: "delivered" }, { new: true });
                // console.log({ sender: req.id === chat.latestMessage?.sender.toString() });
                // Update the chat with the new latest message
                yield ChatModel_1.Chat.findByIdAndUpdate(chat._id, {
                    latestMessage: chat.latestMessage._id,
                });
                yield MessageModel_1.Message.updateMany({
                    $or: [
                        { _id: (_o = chat.latestMessage) === null || _o === void 0 ? void 0 : _o._id },
                        { tempMessageId: (_p = chat.latestMessage) === null || _p === void 0 ? void 0 : _p.tempMessageId },
                    ],
                    status: { $in: ["unseen", "unsent"] }, // criteria for update
                }, { $set: { status: "delivered" } } // update operation
                );
            }
        }));
        // Wait for all updates to complete
        yield Promise.all(updatePromises);
        // Respond with success
        res.status(200).json({ success: true, message: "Messages updated as delivered" });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatMessageAsDeliveredController = updateChatMessageAsDeliveredController;
///
//update message status as remove
const updateMessageStatusAsRemove = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    try {
        const { messageId, tempMessageId, status, chatId } = req.body;
        const prevMessage = yield MessageModel_1.Message.findOne({
            $or: [{ _id: messageId }, { tempMessageId: tempMessageId }],
        });
        if (!status || !messageId || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("Message Id or status cannot be empty!", 400));
        const chat = yield ((_q = ChatModel_1.Chat.findById(chatId)) === null || _q === void 0 ? void 0 : _q.populate("latestMessage"));
        if (((_r = chat === null || chat === void 0 ? void 0 : chat.latestMessage) === null || _r === void 0 ? void 0 : _r._id.toString()) === messageId) {
            return next(new errorHandler_1.CustomErrorHandler("You cannot remove the latestMessage", 400));
        }
        let updateMessage;
        if (status === "removed" || status === "reBack") {
            updateMessage = yield MessageModel_1.Message.findOneAndUpdate({ $or: [{ _id: messageId }, { tempMessageId: tempMessageId }] }, { $set: { status, removedBy: status === "reBack" ? null : req.id } });
        }
        else if (status === "removeFromAll") {
            yield seenByModel_1.MessageSeenBy.deleteMany({ messageId });
            yield MessageModel_1.Message.findOneAndDelete({
                $or: [{ _id: messageId }, { tempMessageId: tempMessageId }],
            });
            return res.status(200).json({ success: true, message: "deleted" });
        }
        // Set the updatedAt field back to its previous value
        updateMessage.updatedAt = prevMessage === null || prevMessage === void 0 ? void 0 : prevMessage.updatedAt;
        res.status(200).json({ success: true, updateMessage });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMessageStatusAsRemove = updateMessageStatusAsRemove;
//update message status as unsent
const updateMessageStatusAsUnsent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t;
    try {
        const { messageId, tempMessageId, status, chatId } = req.body;
        if (!status || !messageId)
            return next(new errorHandler_1.CustomErrorHandler("Message Id or status  cannot be empty!", 400));
        const chat = yield ((_s = ChatModel_1.Chat.findById(chatId)) === null || _s === void 0 ? void 0 : _s.populate("latestMessage"));
        if (((_t = chat === null || chat === void 0 ? void 0 : chat.latestMessage) === null || _t === void 0 ? void 0 : _t._id.toString()) === messageId) {
            return next(new errorHandler_1.CustomErrorHandler("You cannot remove the latestMessage", 400));
        }
        const updateMessage = yield MessageModel_1.Message.updateOne({
            $or: [{ _id: messageId }, { tempMessageId: tempMessageId }],
        }, { $set: { status: "unsent", unsentBy: req.id, content: "unsent" } });
        res.status(200).json({ success: true, updateMessage });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMessageStatusAsUnsent = updateMessageStatusAsUnsent;
//reply Message
const replyMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _u;
    try {
        const { chatId, messageId, content, type, receiverId } = req.body;
        if (!chatId || !messageId) {
            return next(new errorHandler_1.CustomErrorHandler("messageId  or chatId cannot be empty!", 400));
        }
        let message;
        if (type === "file") {
            const fileUploadPromises = req.files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
                const fileType = yield (0, functions_1.getFileType)(file);
                const url = yield cloudinary_1.v2.uploader.upload(file.path, {
                    resource_type: "raw",
                    folder: "Chatiaa_2024",
                    format: file.mimetype === "image/svg+xml" ? "png" : "",
                });
                const localFilePath = file.path;
                fs_1.default.unlink(localFilePath, (err) => {
                    if (err) {
                        console.error(`Error deleting local file: ${err.message}`);
                    }
                    else {
                        //  console.log(`Local file deleted: ${localFilePath}`);
                    }
                });
                //temporary messageid for update user ui instantly
                const tempMessageId = typeof req.body.tempMessageId === "string"
                    ? req.body.tempMessageId
                    : req.body.tempMessageId[index];
                // Create and populate message
                message = yield MessageModel_1.Message.create({
                    sender: req.id,
                    isReply: { repliedBy: req.id, messageId },
                    image: { public_Id: url.public_id, url: url.url },
                    file: { public_Id: url.public_id, url: url.url },
                    chat: chatId,
                    type: file.mimetype === "audio/mp3"
                        ? "audio"
                        : file.mimetype === "image/svg+xml"
                            ? "image"
                            : fileType,
                    tempMessageId,
                });
                message = yield message.populate([
                    {
                        path: "isReply.messageId",
                        select: "content file type",
                        populate: {
                            path: "sender",
                            select: "name image email lastActive createdAt onlineStatus",
                        },
                    },
                    {
                        path: "isReply.repliedBy",
                        select: "name image email lastActive createdAt onlineStatus",
                    },
                    // {
                    //   path: "chat",
                    // },
                ]);
                message = yield UserModel_1.User.populate(message, [
                    {
                        path: "chat.users",
                        select: "name image email lastActive createdAt onlineStatus",
                        options: { limit: 10 },
                    },
                    {
                        path: "sender",
                        select: "name image email lastActive createdAt onlineStatus",
                    },
                ]);
                // Update latest message for the chat
                const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
                    latestMessage: message,
                });
                // Send message to client
                const emitData = message.toObject();
                if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "receiveMessage", chatId, Object.assign(Object.assign({}, emitData), { chat }));
                }
                else {
                    index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                        .to(receiverId)
                        .emit("receiveMessage", Object.assign(Object.assign({}, emitData), { receiverId }));
                }
                return emitData;
            }));
            // Wait for all file uploads to complete
            // Wait for all file uploads to complete
            yield Promise.all(fileUploadPromises);
            // Send response only after all file uploads are completed
            // res.status(200).json({ message: "Replied files send successfully" });
        }
        else {
            message = yield MessageModel_1.Message.create({
                sender: req.id,
                isReply: { repliedBy: req.id, messageId },
                content,
                type: "text",
                chat: chatId,
                tempMessageId: req.body.tempMessageId,
            });
        }
        message = yield MessageModel_1.Message.findOne({
            $or: [{ _id: message._id }, { tempMessageId: (_u = req.body) === null || _u === void 0 ? void 0 : _u.tempMessageId }],
        })
            .populate("sender chat", "name image email lastActive createdAt onlineStatus")
            .populate([
            {
                path: "isReply.messageId",
                select: "content file type",
                populate: {
                    path: "sender",
                    select: "name image email lastActive createdAt onlineStatus",
                },
            },
            {
                path: "isReply.repliedBy",
                select: "name image email lastActive createdAt onlineStatus",
            },
        ])
            .populate("chat");
        message = yield UserModel_1.User.populate(message, {
            path: "chat.users",
            select: "name image email lastActive createdAt onlineStatus",
        });
        const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: message });
        //send to client
        const emitData = message.toObject();
        if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "receiveMessage", chatId, emitData);
        }
        else {
            const receiverSocketId = yield (0, index_1.getSocketConnectedUser)(receiverId);
            index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                .to(receiverSocketId === null || receiverSocketId === void 0 ? void 0 : receiverSocketId.socketId)
                .emit("receiveMessage", Object.assign(Object.assign({}, emitData), { receiverId })); ///added event as replyMessage
        }
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.replyMessage = replyMessage;
//edit message
const editMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _v, _w, _x;
    try {
        const { messageId, chatId, content, type, receiverId } = req.body;
        if (!messageId) {
            return next(new errorHandler_1.CustomErrorHandler("messageId  cannot be empty!", 400));
        }
        const isLastMessage = yield ChatModel_1.Chat.findOne({ _id: chatId, latestMessage: messageId });
        const prevMessage = yield MessageModel_1.Message.findOne({
            _id: messageId,
        });
        //delete Previous Image
        if ((_v = prevMessage.file) === null || _v === void 0 ? void 0 : _v.public_Id) {
            yield cloudinary_1.v2.uploader.destroy((_w = prevMessage.file) === null || _w === void 0 ? void 0 : _w.public_Id);
        }
        let editedChat;
        if (type === "file") {
            const fileUploadPromises = req.files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
                const fileType = yield (0, functions_1.getFileType)(file);
                const url = yield cloudinary_1.v2.uploader.upload(file.path, {
                    resource_type: "raw",
                    folder: "Chatiaa_2024",
                    format: file.mimetype === "image/svg+xml" ? "png" : "",
                });
                const localFilePath = file.path;
                fs_1.default.unlink(localFilePath, (err) => {
                    if (err) {
                        console.error(`Error deleting local file: ${err.message}`);
                    }
                    else {
                        //  console.log(`Local file deleted: ${localFilePath}`);
                    }
                });
                //temporary messageid for update user ui instantly
                const tempMessageId = typeof req.body.tempMessageId === "string"
                    ? req.body.tempMessageId
                    : req.body.tempMessageId[index];
                editedChat = yield MessageModel_1.Message.findByIdAndUpdate(messageId, {
                    content: "",
                    isEdit: { editedBy: req.id },
                    file: { public_Id: url.public_id, url: url.url },
                    type: file.mimetype === "audio/mp3"
                        ? "audio"
                        : file.mimetype === "image/svg+xml"
                            ? "image"
                            : fileType,
                    tempMessageId,
                }, { new: true })
                    .populate("sender isEdit.editedBy", "name email image")
                    .populate("chat");
                editedChat = yield UserModel_1.User.populate(editedChat, {
                    path: "chat.users",
                    select: "name image email lastActive createdAt onlineStatus",
                });
                if (isLastMessage) {
                    yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: editedChat });
                }
                const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId);
                // Send message to client
                const emitData = editedChat.toObject();
                if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "editMessage", chatId, emitData);
                }
                else {
                    index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                        .to(receiverId)
                        .emit("editMessage", Object.assign(Object.assign({}, emitData), { receiverId }));
                }
                return emitData;
            }));
            // Wait for all file uploads to complete
            yield Promise.all(fileUploadPromises);
            res.status(200).json({ message: "Edit Message sucessfully" });
        }
        else {
            if (!messageId || !content) {
                return next(new errorHandler_1.CustomErrorHandler("messageId or content  cannot be empty!", 400));
            }
            const message = yield MessageModel_1.Message.findOne({ _id: messageId });
            if ((_x = message === null || message === void 0 ? void 0 : message.file) === null || _x === void 0 ? void 0 : _x.public_Id) {
                yield cloudinary_1.v2.uploader.destroy(message.file.public_Id);
            }
            editedChat = yield MessageModel_1.Message.findByIdAndUpdate(messageId, {
                isEdit: { editedBy: req.id },
                content,
                type: "text",
                file: null,
                tempMessageId: req.body.tempMessageId,
            }, { new: true })
                .populate("sender isEdit.editedBy", "name email image onlineStatus lastActive createdAt")
                .populate("chat");
            editedChat = yield UserModel_1.User.populate(editedChat, {
                path: "chat.users",
                select: "name image email lastActive createdAt onlineStatus",
            });
        }
        if (isLastMessage) {
            yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: editedChat });
        }
        const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId);
        // Send message to cliento
        const emitData = editedChat.toObject();
        if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "editMessage", chatId, emitData);
        }
        else {
            index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                .to(receiverId)
                .emit("editMessage", Object.assign(Object.assign({}, emitData), { receiverId }));
        }
        res.status(200).json({ success: true, editedChat });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.editMessage = editMessage;
//addRemoveEmojiReaction
const addRemoveEmojiReactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId, emoji, type, reactionId, receiverId, chatId, tempReactionId } = req.body;
        const chat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId);
        // const currentUser=await User.findById
        switch (type) {
            case "add": {
                if (!messageId || !emoji) {
                    return next(new errorHandler_1.CustomErrorHandler("messageId or emoji cannot be empty!", 400));
                }
                const existingReaction = yield reactModal_1.Reaction.findOne({
                    messageId,
                    reactBy: req.id,
                });
                if (existingReaction) {
                    // Emoji update logic
                    const reaction = yield reactModal_1.Reaction.findOneAndUpdate({ messageId, reactBy: req.id }, { emoji }, { new: true }).populate("reactBy", "name email image onlineStatus lastActive createdAt");
                    // Send message to client
                    if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                        const emitData = { reaction, type: "update" };
                        yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "addReactionOnMessage", chatId, emitData);
                    }
                    else {
                        index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                            .to(receiverId)
                            .emit("addReactionOnMessage", { reaction, type: "update" });
                    }
                    res.status(200).json({ success: true, reaction });
                }
                else {
                    // Create a new reaction
                    let react = yield reactModal_1.Reaction.create({
                        messageId,
                        emoji,
                        reactBy: req.id,
                        tempReactionId,
                    });
                    const reaction = yield react.populate("reactBy", "name email image onlineStatus lastActive createdAt");
                    // Send message to client
                    if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                        const emitData = { reaction, type: "add" };
                        yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "addReactionOnMessage", chatId, emitData);
                    }
                    else {
                        index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                            .to(receiverId)
                            .emit("addReactionOnMessage", { reaction, type: "add" });
                    }
                    res.status(200).json({ success: true, reaction });
                }
                break;
            }
            case "remove": {
                if (!reactionId || !tempReactionId)
                    return next(new errorHandler_1.CustomErrorHandler("reactionId cannot be empty!", 400));
                const reaction = yield reactModal_1.Reaction.findOneAndDelete({
                    $or: [
                        { tempReactionId }, // Assuming tempReactionId is the field name
                        { _id: reactionId }, // Assuming reactionId is the field name for the permanent ID
                    ],
                });
                if (chat === null || chat === void 0 ? void 0 : chat.isGroupChat) {
                    const emitData = { reaction, type: "remove" };
                    yield (0, groupSocket_1.emitEventToGroupUsers)(index_1.io, "addReactionOnMessage", chatId, emitData);
                }
                else {
                    index_1.io.to(chat === null || chat === void 0 ? void 0 : chat._id.toString())
                        .to(receiverId)
                        .emit("addReactionOnMessage", {
                        reaction,
                        type: "remove",
                    });
                }
                res.status(200).json({ success: true, reaction });
                break;
            }
            default:
                res.status(400).json({ success: false, message: "Invalid operation type" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.addRemoveEmojiReactions = addRemoveEmojiReactions;
