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
exports.emitEventToOnlineUsers = exports.markMessageAsDeliverdAfteronlineFriend = exports.emitEventToGroupUsers = void 0;
const ChatModel_1 = require("../model/ChatModel");
const __1 = require("..");
const UserModel_1 = require("../model/UserModel");
const onlineUsersModel_1 = require("../model/onlineUsersModel");
// Function to emit an event to users within a chat
const emitEventToGroupUsers = (io, event, chatId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chatUsers = yield ChatModel_1.Chat.findById(chatId);
    chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users.forEach((chatUserId) => __awaiter(void 0, void 0, void 0, function* () {
        const receiverId = yield (0, __1.getSocketConnectedUser)(chatUserId.toString());
        console.log({ data });
        if (receiverId) {
            const { userId, socketId } = receiverId;
            const id = userId.toString();
            //.to(chatId)
            io.to(socketId).emit(event, Object.assign(Object.assign({}, data), { receiverId: id }));
        }
    }));
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
    chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!chat.latestMessage) {
            return; // Skip chats without a latest message
        }
        // Update the latest message's status to "delivered"
        if (((_a = chat.latestMessage) === null || _a === void 0 ? void 0 : _a.status) === "unseen" &&
            ((_b = chat.latestMessage) === null || _b === void 0 ? void 0 : _b.sender.toString()) !== userId) {
            const receiverId = yield (0, __1.getSocketConnectedUser)((_c = chat.latestMessage) === null || _c === void 0 ? void 0 : _c.sender.toString());
            if (receiverId) {
                io.to(receiverId.socketId).emit("receiveDeliveredAllMessageAfterReconnect", {
                    chatId: chat === null || chat === void 0 ? void 0 : chat._id,
                });
            }
        }
    }));
});
exports.markMessageAsDeliverdAfteronlineFriend = markMessageAsDeliverdAfteronlineFriend;
//chats of chat
// Function to emit an event to online users based on userId
const emitEventToOnlineUsers = (io, eventName, userId, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.User.findOneAndUpdate({ _id: userId }, { $set: { lastActive: new Date(Date.now()) } }, { new: true });
        const chats = yield ChatModel_1.Chat.find({ users: { $elemMatch: { $eq: userId } } });
        chats === null || chats === void 0 ? void 0 : chats.forEach((chatUsers) => {
            chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users.forEach((chatUserId) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const receiverId = yield (0, __1.getSocketConnectedUser)(chatUserId.toString());
                //check if any user is online
                const userIds = (_a = chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users) === null || _a === void 0 ? void 0 : _a.map((user) => user === null || user === void 0 ? void 0 : user.toString());
                // Query onlineUsersModel for online status of filtered users
                const onlineUsers = yield onlineUsersModel_1.onlineUsersModel.find({ userId: { $in: userIds } });
                // Map the online status to userIds
                const onlineUserIds = onlineUsers.map((user) => user.userId.toString());
                const isAnyGroupUserOnline = (_b = chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users) === null || _b === void 0 ? void 0 : _b.some((user) => {
                    return onlineUserIds.includes(user === null || user === void 0 ? void 0 : user.toString()) && onlineUserIds.length > 1;
                });
                if (receiverId) {
                    const { id, socketId } = receiverId;
                    io.to(socketId).emit(eventName, Object.assign(Object.assign({}, eventData), { chatId: chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers._id, isAnyGroupUserOnline, userInfo: {
                            userId: userInfo === null || userInfo === void 0 ? void 0 : userInfo._id,
                            lastActive: userInfo === null || userInfo === void 0 ? void 0 : userInfo.lastActive,
                        } }));
                }
            }));
        });
    }
    catch (error) {
        console.error("Error emitting event to online users:", error);
    }
});
exports.emitEventToOnlineUsers = emitEventToOnlineUsers;
