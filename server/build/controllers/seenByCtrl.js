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
        const isMessageExists = yield MessageModel_1.Message.findOne({ $or: [{ _id: messageId }, { tempMessageId }] });
        const isChatExists = yield ChatModel_1.Chat.findOne({ _id: chatId });
        if (!isMessageExists || !isChatExists) {
            return next(new errorHandler_1.CustomErrorHandler("Message or Chat does not exist", 404));
        }
        // Check if there is an existing record for the user and chat
        let existingSeenBy = yield seenByModel_1.MessageSeenBy.findOne({ chatId, userId: req.id });
        // If there's an existing record, delete it
        if (existingSeenBy) {
            yield seenByModel_1.MessageSeenBy.findByIdAndDelete(existingSeenBy._id);
        }
        // Create a new record for the user and chat with the latest message seen
        const newSeenMessage = new seenByModel_1.MessageSeenBy({
            chatId,
            userId: req.id,
            messageId,
        });
        yield newSeenMessage.save();
        res
            .status(200)
            .json({ message: "Message seen successfully", seenMessage: newSeenMessage });
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
