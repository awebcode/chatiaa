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
exports.getFileType = exports.sentGroupNotifyMessage = exports.sentSocketTextMessage = void 0;
const ChatModel_1 = require("../model/ChatModel");
const MessageModel_1 = require("../model/MessageModel");
const UserModel_1 = require("../model/UserModel");
const sentSocketTextMessage = (newMessage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var data = {
            sender: newMessage.sender,
            content: newMessage.content,
            chat: newMessage.chat,
            type: "text",
        };
        let message;
        message = yield MessageModel_1.Message.create(data);
        message = yield message.populate("sender", "name image email lastActive");
        message = yield message.populate("chat");
        // message = await message.populate("chat")
        message = yield UserModel_1.User.populate(message, {
            path: "sender chat.users",
            select: "name image email lastActive",
        });
        yield ChatModel_1.Chat.findByIdAndUpdate(newMessage.chat, { latestMessage: message });
        return message._doc;
    }
    catch (error) {
        console.log({ error });
    }
});
exports.sentSocketTextMessage = sentSocketTextMessage;
const sentGroupNotifyMessage = (newMessage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var data = {
            sender: newMessage.user._id,
            content: newMessage === null || newMessage === void 0 ? void 0 : newMessage.message,
            chat: newMessage.chatId,
            type: "notify",
            status: "notify",
        };
        let message;
        message = yield MessageModel_1.Message.create(data);
        message = yield message.populate("sender", "name image email lastActive");
        message = yield message.populate("chat");
        // message = await message.populate("chat")
        message = yield UserModel_1.User.populate(message, {
            path: "sender chat.users",
            select: "name image email lastActive",
        });
        yield ChatModel_1.Chat.findByIdAndUpdate(newMessage.chatId, { latestMessage: message });
        return message;
    }
    catch (error) {
        console.log({ error });
    }
});
exports.sentGroupNotifyMessage = sentGroupNotifyMessage;
//get file type
const getFileType = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileTypeFromFile } = yield eval('import("file-type")');
        const detectedType = yield fileTypeFromFile(file.path);
        let type;
        if (detectedType) {
            // Assign type based on detected MIME type
            const mimeType = detectedType.mime.split("/")[0];
            switch (mimeType) {
                case "image":
                    type = "image";
                    break;
                case "audio":
                    type = "audio";
                    break;
                case "video":
                    type = "video";
                    break;
                case "application":
                    type = "application";
                    break;
                default:
                    type = "file";
                    break;
            }
        }
        else {
            type = ""; // Return undefined if MIME type is not detected
        }
        return type;
    }
    catch (error) {
        console.error("Error detecting file type:", error);
        throw error;
    }
});
exports.getFileType = getFileType;
