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
exports.addRemoveEmojiReactions = exports.editMessage = exports.replyMessage = exports.updateChatStatusAsBlockOrUnblock = exports.updateMessageStatusAsUnsent = exports.updateMessageStatusAsRemove = exports.updateChatMessageAsDeliveredController = exports.updateAllMessageStatusSeen = exports.updateChatMessageController = exports.sendMessage = exports.allMessages = void 0;
const MessageModel_1 = require("../model/MessageModel");
const UserModel_1 = require("../model/UserModel");
const ChatModel_1 = require("../model/ChatModel");
const errorHandler_1 = require("../middlewares/errorHandler");
const reactModal_1 = require("../model/reactModal");
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
//@access          Protected
const allMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        let messages = yield MessageModel_1.Message.find({ chat: req.params.chatId })
            .populate({
            path: "isReply.messageId",
            select: "content image",
            populate: { path: "sender", select: "username pic email" },
        })
            .populate("sender removedBy", "username pic email")
            .populate("chat")
            .sort({ _id: -1 }) // Use _id for sorting in descending order
            .limit(limit)
            .skip(skip);
        // Populate reactions for each message
        messages = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            const reactions = yield reactModal_1.Reaction.find({ messageId: message._id })
                .populate({
                path: "reactBy",
                select: "username pic email",
            })
                .sort({ updatedAt: -1 })
                .exec();
            return Object.assign(Object.assign({}, message.toObject()), { reactions });
        })));
        //find reactions here and pass with every message
        //@
        const total = yield MessageModel_1.Message.countDocuments({ chat: req.params.chatId });
        res.json({ messages, total, limit });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.allMessages = allMessages;
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId, type, createdAt } = req.body;
    if (!chatId) {
        return next(new errorHandler_1.CustomErrorHandler("Chat Id cannot be empty!", 400));
    }
    var newMessage = {
        sender: req.id,
        content: content,
        chat: chatId,
        createdAt,
    };
    try {
        var message;
        if (type === "image") {
            const url = yield cloudinary_1.v2.uploader.upload(req.file.path);
            const localFilePath = req.file.path;
            fs_1.default.unlink(localFilePath, (err) => {
                if (err) {
                    console.error(`Error deleting local file: ${err.message}`);
                }
                else {
                    console.log(`Local file deleted: ${localFilePath}`);
                }
            });
            var newImageMessage = {
                sender: req.id,
                image: { public_Id: url.public_id, url: url.url },
                chat: chatId,
            };
            message = yield MessageModel_1.Message.create(newImageMessage);
            console.log({ message });
        }
        else {
            message = yield MessageModel_1.Message.create(newMessage);
        }
        message = yield message.populate("sender chat", "username pic");
        // message = await message.populate("chat")
        message = yield UserModel_1.User.populate(message, {
            path: "chat.users",
            select: "username pic email",
        });
        yield ChatModel_1.Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
        res.json(message);
    }
    catch (error) {
        next(error);
    }
});
exports.sendMessage = sendMessage;
//update message status
const updateChatMessageController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { chatId, status } = req.body;
        if (!status || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("Chat Id or status cannot be empty!", 400));
        const chat = yield ((_a = ChatModel_1.Chat.findById(chatId)) === null || _a === void 0 ? void 0 : _a.populate("latestMessage"));
        if (!chat || !chat.latestMessage) {
            return next(new errorHandler_1.CustomErrorHandler("Chat or latest message not found", 404));
        }
        const updateMessage = yield MessageModel_1.Message.findByIdAndUpdate(chat.latestMessage._id, { status }, { new: true });
        const updateChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            latestMessage: updateMessage === null || updateMessage === void 0 ? void 0 : updateMessage._id,
        })
            .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username pic" },
        })
            .populate("users", "username pic");
        res.status(200).json({ success: true, chat: updateChat });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatMessageController = updateChatMessageController;
//update all messages status as seen
const updateAllMessageStatusSeen = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    try {
        if (!req.params.chatId)
            return next(new errorHandler_1.CustomErrorHandler("Chat Id  cannot be empty!", 400));
        const lastMessage = yield ChatModel_1.Chat.findById(req.params.chatId).populate("latestMessage");
        if (((_c = (_b = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _b === void 0 ? void 0 : _b.sender) === null || _c === void 0 ? void 0 : _c.toString()) === req.id) {
            return;
        }
        yield ChatModel_1.Chat.findByIdAndUpdate(req.params.chatId, {
            latestMessage: (_d = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _d === void 0 ? void 0 : _d._id,
        });
        const updatedMessage = yield MessageModel_1.Message.find({ chat: req.params.chatId }, {
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
            var _e, _f;
            if (!chat.latestMessage) {
                return; // Skip chats without a latest message
            }
            // Update the latest message's status to "delivered"
            if (((_e = chat.latestMessage) === null || _e === void 0 ? void 0 : _e.status) === "unseen" &&
                ((_f = chat.latestMessage) === null || _f === void 0 ? void 0 : _f.sender.toString()) !== req.id) {
                yield MessageModel_1.Message.findByIdAndUpdate(chat.latestMessage._id, { status: "delivered" }, { new: true });
                // console.log({ sender: req.id === chat.latestMessage?.sender.toString() });
                // Update the chat with the new latest message
                yield ChatModel_1.Chat.findByIdAndUpdate(chat._id, {
                    latestMessage: chat.latestMessage._id,
                });
                yield MessageModel_1.Message.find({ chat: chat._id }, {
                    status: { $in: ["unseen", "unsent"] },
                    // sender: { $ne: req.id }
                }).updateMany({
                    status: "delivered"
                });
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
    var _g, _h;
    try {
        const { messageId, status, chatId } = req.body;
        const prevMessage = yield MessageModel_1.Message.findById({ _id: messageId });
        if (!status || !messageId || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("Message Id or status cannot be empty!", 400));
        const chat = yield ((_g = ChatModel_1.Chat.findById(chatId)) === null || _g === void 0 ? void 0 : _g.populate("latestMessage"));
        if (((_h = chat === null || chat === void 0 ? void 0 : chat.latestMessage) === null || _h === void 0 ? void 0 : _h._id.toString()) === messageId) {
            return next(new errorHandler_1.CustomErrorHandler("You cannot remove the latestMessage", 400));
        }
        let updateMessage;
        if (status === "remove" || status === "reBack") {
            updateMessage = yield MessageModel_1.Message.updateOne({ _id: messageId }, { $set: { status, removedBy: status === "reBack" ? null : req.id } });
        }
        else if (status === "removeFromAll") {
            yield MessageModel_1.Message.findByIdAndDelete(messageId);
            return res.status(200).json({ success: true });
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
    var _j, _k;
    try {
        const { messageId, status, chatId } = req.body;
        if (!status || !messageId)
            return next(new errorHandler_1.CustomErrorHandler("Message Id or status  cannot be empty!", 400));
        const chat = yield ((_j = ChatModel_1.Chat.findById(chatId)) === null || _j === void 0 ? void 0 : _j.populate("latestMessage"));
        if (((_k = chat === null || chat === void 0 ? void 0 : chat.latestMessage) === null || _k === void 0 ? void 0 : _k._id.toString()) === messageId) {
            return next(new errorHandler_1.CustomErrorHandler("You cannot remove the latestMessage", 400));
        }
        const updateMessage = yield MessageModel_1.Message.updateOne({ _id: messageId }, { $set: { status: "unsent", unsentBy: req.id, content: "unsent" } });
        res.status(200).json({ success: true, updateMessage });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMessageStatusAsUnsent = updateMessageStatusAsUnsent;
//update Chat status as Blocked/Unblocked
const updateChatStatusAsBlockOrUnblock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const { chatId, status } = req.body;
        if (!status || !chatId)
            return next(new errorHandler_1.CustomErrorHandler("chat Id or status  cannot be empty!", 400));
        const updatedChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { chatStatus: { status, updatedBy: req.id } }, { new: true });
        res.status(200).json({
            success: true,
            status: (_l = updatedChat === null || updatedChat === void 0 ? void 0 : updatedChat.chatStatus) === null || _l === void 0 ? void 0 : _l.status,
            updatedBy: req.id,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatStatusAsBlockOrUnblock = updateChatStatusAsBlockOrUnblock;
//reply Message
const replyMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, messageId, content, type } = req.body;
        if (!chatId || !messageId) {
            return next(new errorHandler_1.CustomErrorHandler("messageId  or chatId cannot be empty!", 400));
        }
        let message;
        if (type === "image") {
            if (!req.file.path) {
                return next(new errorHandler_1.CustomErrorHandler("Image  cannot be empty!", 400));
            }
            const url = yield cloudinary_1.v2.uploader.upload(req.file.path);
            const localFilePath = req.file.path;
            fs_1.default.unlink(localFilePath, (err) => {
                if (err) {
                    console.error(`Error deleting local file: ${err.message}`);
                }
                else {
                    console.log(`Local file deleted: ${localFilePath}`);
                }
            });
            message = yield MessageModel_1.Message.create({
                sender: req.id,
                isReply: { repliedBy: req.id, messageId },
                image: { public_Id: url.public_id, url: url.url },
                chat: chatId,
            });
        }
        else {
            message = yield MessageModel_1.Message.create({
                sender: req.id,
                isReply: { repliedBy: req.id, messageId },
                content,
                chat: chatId,
            });
        }
        message = yield message.populate("sender chat", "username pic");
        // message = await message.populate("chat")
        message = yield UserModel_1.User.populate(message, {
            path: "chat.users",
            select: "username pic email",
        });
        yield ChatModel_1.Chat.findByIdAndUpdate(chatId, { latestMessage: message });
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.replyMessage = replyMessage;
//edit message
const editMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const { messageId, content, type } = req.body;
        if (!messageId)
            return next(new errorHandler_1.CustomErrorHandler("messageId  cannot be empty!", 400));
        const prevMessage = yield MessageModel_1.Message.findById(messageId);
        //delete Previous Image
        if ((_m = prevMessage.image) === null || _m === void 0 ? void 0 : _m.public_Id) {
            yield cloudinary_1.v2.uploader.destroy((_o = prevMessage.image) === null || _o === void 0 ? void 0 : _o.public_Id);
        }
        let editedChat;
        if (type === "image") {
            if (!messageId || !req.file.path) {
                return next(new errorHandler_1.CustomErrorHandler("messageId or file cannot be empty!", 400));
            }
            const url = yield cloudinary_1.v2.uploader.upload(req.file.path);
            const localFilePath = req.file.path;
            fs_1.default.unlink(localFilePath, (err) => {
                if (err) {
                    console.error(`Error deleting local file: ${err.message}`);
                }
                else {
                    console.log(`Local file deleted: ${localFilePath}`);
                }
            });
            editedChat = yield MessageModel_1.Message.findByIdAndUpdate(messageId, {
                isEdit: { editedBy: req.id },
                image: { public_Id: url.public_id, url: url.url },
            }, { new: true });
        }
        else {
            if (!messageId || !content)
                return next(new errorHandler_1.CustomErrorHandler("messageId or content  cannot be empty!", 400));
            editedChat = yield MessageModel_1.Message.findByIdAndUpdate(messageId, {
                isEdit: { editedBy: req.id },
                content,
            }, { new: true });
        }
        res.status(200).json({ success: true, editedChat });
    }
    catch (error) {
        next(error);
    }
});
exports.editMessage = editMessage;
//addRemoveEmojiReaction
const addRemoveEmojiReactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId, emoji, type, reactionId } = req.body;
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
                    const reaction = yield reactModal_1.Reaction.findOneAndUpdate({ messageId, reactBy: req.id }, { $set: { emoji } }, { new: true, upsert: true });
                    res.status(200).json({ success: true, reaction });
                }
                else {
                    // Create a new reaction
                    const reaction = yield reactModal_1.Reaction.create({
                        messageId,
                        emoji,
                        reactBy: req.id,
                    });
                    res.status(200).json({ success: true, reaction });
                }
                break;
            }
            case "remove": {
                if (!reactionId)
                    return next(new errorHandler_1.CustomErrorHandler("reactionId cannot be empty!", 400));
                const reaction = yield reactModal_1.Reaction.findByIdAndDelete(reactionId);
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
