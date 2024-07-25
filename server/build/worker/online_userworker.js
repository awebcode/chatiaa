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
const worker_threads_1 = require("worker_threads");
const ChatModel_1 = require("../model/ChatModel"); // Adjust the path as needed
const UserModel_1 = require("../model/UserModel"); // Adjust the path as needed
const index_1 = require("../index"); // Adjust the path as needed
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, socketId } = worker_threads_1.workerData;
        const chatUsers = yield ChatModel_1.Chat.find({ users: userId });
        const onlineUsersData = [];
        yield Promise.all(chatUsers.map((chatUser) => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(chatUser.users.map((chatUserId) => __awaiter(void 0, void 0, void 0, function* () {
                const receiverId = yield (0, index_1.getSocketConnectedUser)(chatUserId.toString());
                if (receiverId) {
                    const { userId: receiverUserId } = receiverId;
                    const id = receiverUserId.toString();
                    const userInfo = yield UserModel_1.User.findById(userId).select("name image lastActive");
                    onlineUsersData.push({
                        chatId: chatUser._id,
                        userId,
                        socketId,
                        userInfo,
                        receiverId: id,
                    });
                }
            })));
        })));
        // Send the data back to the main thread
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(onlineUsersData);
    }
    catch (error) {
        let err = error;
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ error: err.message });
    }
}))();
