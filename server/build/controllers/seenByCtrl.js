"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeenByInfoForSingleMessage = exports.pushSeenBy = void 0;
const MessageModel_1 = require("../model/MessageModel");
const errorHandler_1 = require("../middlewares/errorHandler");
const seenByModel_1 = require("../model/seenByModel");
const ChatModel_1 = require("../model/ChatModel");
const pushSeenBy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId, chatId, tempMessageId } = req.body;
        // Check if the message exists
        const isMessageExists = yield MessageModel_1.Message.findOne({
            $or: [{ _id: messageId }, { tempMessageId }],
        });
        const isChatExists = yield ChatModel_1.Chat.findOne({ _id: chatId });
        if (!isMessageExists || !isChatExists) {
            return next(new errorHandler_1.CustomErrorHandler("Message or Chat does not exist", 404));
        }
        // Find all existing records for the user and chat
        let existingSeenBy = yield seenByModel_1.MessageSeenBy.find({
            chatId,
            userId: req.id,
        });
        // If there are existing records, delete them
        if (existingSeenBy.length > 0) {
            yield seenByModel_1.MessageSeenBy.deleteMany({
                chatId,
                userId: req.id,
            });
        }
        // Create a new record for the user and chat with the latest message seen
        const newSeenMessage = yield seenByModel_1.MessageSeenBy.create({
            chatId,
            userId: req.id,
            messageId,
        });
        res.status(200).json({ message: "Message seen!", seenMessage: newSeenMessage });
    }
    catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
});
exports.pushSeenBy = pushSeenBy;
//getSeenByInfoForMessage
const getSeenByInfoForSingleMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId, chatId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        // const skip = (page - 1) * limit;
        const skip = parseInt(req.query.skip) || 0;
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        let users = yield seenByModel_1.MessageSeenBy.find({ chatId, messageId })
            .populate({
            path: "userId",
            match: keyword,
            select: "name email image createdAt lastActive onlineStatus",
        })
            .select("-_id userId")
            .sort({ _id: -1 })
            .limit(limit)
            .skip(skip);
        // Filter out null userId entries
        users = users.filter((user) => user.userId !== null);
        // Calculate total count only for non-null userId entries
        let totalFound = yield seenByModel_1.MessageSeenBy.find({ chatId, messageId })
            .populate({
            path: "userId",
            match: keyword,
        })
            .select("-_id userId");
        let total = totalFound.filter((user) => user.userId !== null).length;
        res.status(200).json({ users, total, limit, skip });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
});
exports.getSeenByInfoForSingleMessage = getSeenByInfoForSingleMessage;
