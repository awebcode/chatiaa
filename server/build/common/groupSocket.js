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
exports.markMessageAsDeliverdAfteronlineFriend = exports.emitEventToGroupUsers = void 0;
const ChatModel_1 = require("../model/ChatModel");
const __1 = require("..");
// Function to emit an event to users within a chat
const emitEventToGroupUsers = (io, event, chatId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chatUsers = yield ChatModel_1.Chat.findById(chatId);
    chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users.forEach((userId) => {
        const receiverId = (0, __1.getSocketConnectedUser)(userId.toString());
        if (receiverId) {
            const { id, socketId } = receiverId;
            //.to(chatId)
            io.to(socketId).emit(event, Object.assign(Object.assign({}, data), { receiverId: id }));
        }
    });
});
exports.emitEventToGroupUsers = emitEventToGroupUsers;
// Example usage:
// io and socket can be passed as arguments to the function when it's called
// emitEventToChatUsers(io, "remove_remove_All_unsentMessage", message.chatId, message);
const markMessageAsDeliverdAfteronlineFriend = (io, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield ChatModel_1.Chat.find({ users: { $in: [userId] } }).populate("latestMessage");
    if (!chats || chats.length === 0) {
        return;
    }
    chats.map((chat) => {
        var _a, _b, _c;
        if (!chat.latestMessage) {
            return; // Skip chats without a latest message
        }
        // Update the latest message's status to "delivered"
        if (((_a = chat.latestMessage) === null || _a === void 0 ? void 0 : _a.status) === "unseen" &&
            ((_b = chat.latestMessage) === null || _b === void 0 ? void 0 : _b.sender.toString()) !== userId) {
            const receiverId = (0, __1.getSocketConnectedUser)((_c = chat.latestMessage) === null || _c === void 0 ? void 0 : _c.sender.toString());
            if (receiverId) {
                io.to(receiverId.socketId).emit("receiveDeliveredAllMessageAfterReconnect", { chatId: chat === null || chat === void 0 ? void 0 : chat._id });
            }
        }
    });
});
exports.markMessageAsDeliverdAfteronlineFriend = markMessageAsDeliverdAfteronlineFriend;
