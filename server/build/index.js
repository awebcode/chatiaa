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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketConnectedUser = exports.io = void 0;
// server.ts
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const connectDb_1 = __importDefault(require("./config/connectDb"));
const cloudinaryConfig_1 = __importDefault(require("./config/cloudinaryConfig"));
const dotenv_1 = require("dotenv");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const UserModel_1 = require("./model/UserModel");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dotenv_1.config)();
const functions_1 = require("./controllers/functions");
const ChatModel_1 = require("./model/ChatModel");
const groupSocket_1 = require("./common/groupSocket");
const app = (0, express_1.default)();
// app.use(uploadMiddleware.array("files"));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
const server = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
// Enable CORS for all routes
const corsOptions = {
    origin: ["http://localhost:3000", "https://messengaria.vercel.app"], // Allow requests from this specific origin
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
(0, cloudinaryConfig_1.default)();
app.use("/api/v1", authRoutes_1.default);
app.use("/api/v1", chatRoutes_1.default);
app.use("/api/v1", messageRoutes_1.default);
let users = [];
const checkOnlineUsers = (id, socketId) => {
    if (!users.some((user) => user.id === id)) {
        users.push({ socketId, id });
    }
};
const removeUser = (socketId) => __awaiter(void 0, void 0, void 0, function* () {
    const removedUserIndex = users.findIndex((user) => user.socketId === socketId);
    if (removedUserIndex !== -1) {
        const removedUser = users[removedUserIndex];
        users.splice(removedUserIndex, 1);
        try {
            //update lastActivity time
            yield UserModel_1.User.findOneAndUpdate({ _id: removedUser.id }, { $set: { lastActive: new Date(Date.now()) } }, { new: true });
        }
        catch (error) {
            console.error("Error updating lastActive:", error);
        }
    }
});
const getSocketConnectedUser = (id) => {
    return users.find((user) => user.id === id || user.socketId === id);
};
exports.getSocketConnectedUser = getSocketConnectedUser;
// WebSocket server logic
exports.io.on("connection", (socket) => {
    socket.on("setup", (userData) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(userData.id);
        checkOnlineUsers(userData.id, socket.id);
        //store connected users
        let alreadyConnectedOnlineUsers = [];
        //only send online users notify there who connected with new connected user
        const chats = yield ChatModel_1.Chat.find({ users: { $elemMatch: { $eq: userData.id } } });
        chats === null || chats === void 0 ? void 0 : chats.forEach((chatUsers) => {
            chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users.forEach((userId) => {
                const receiverId = (0, exports.getSocketConnectedUser)(userId.toString());
                if (receiverId) {
                    const { id, socketId } = receiverId;
                    const existsConn = alreadyConnectedOnlineUsers.find((conn) => conn.id === id);
                    if (existsConn) {
                        return;
                    }
                    else {
                        alreadyConnectedOnlineUsers.push({ id, socketId });
                    }
                    exports.io.to(id).emit("addOnlineUsers", { id: userData.id, socketId: socket.id });
                }
            });
        });
        //send to new connected users
        socket.emit("alreadyConnectedOnlineUsers", alreadyConnectedOnlineUsers);
        // io.emit("setup", users);
        console.log("Client connected");
    }));
    socket.on("join", (data) => {
        socket.join(data.chatId);
        exports.io.emit("join", data.chatId);
    });
    // Handle incoming messages from clients
    socket.on("sentMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
        // Broadcast the message to all connected clients
        const data = yield (0, functions_1.sentSocketTextMessage)({
            chat: message.chatId,
            sender: message.senderId,
            content: message.content,
        });
        if (message.isGroupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(exports.io, "receiveMessage", message.chatId, data);
            //  socket.emit("receiveMessage", message);
        }
        else {
            //all connected clients in room
            exports.io.to(message.chatId)
                .to(message.receiverId)
                .emit("receiveMessage", Object.assign(Object.assign({}, data), { receiverId: message.receiverId }));
        }
    }));
    //ReplyMessage
    socket.on("replyMessage", (message) => __awaiter(void 0, void 0, void 0, function* () { }));
    //EditMessage
    socket.on("editMessage", (message) => __awaiter(void 0, void 0, void 0, function* () { }));
    //addReactionOnMessage
    socket.on("addReactionOnMessage", (message) => __awaiter(void 0, void 0, void 0, function* () { }));
    //remove_remove_All_unsentMessage
    socket.on("remove_remove_All_unsentMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.groupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "remove_remove_All_unsentMessage", message.chatId, message);
        }
        else {
            exports.io.to(message.receiverId).emit("remove_remove_All_unsentMessage", message);
        }
    }));
    //removeFromAll
    //deliveredMessage
    socket.on("seenMessage", (message) => {
        socket.to(message.receiverId).emit("receiveSeenMessage", message);
    });
    //deliveredMessage
    socket.on("deliveredMessage", (message) => {
        socket.to(message.receiverId).emit("receiveDeliveredMessage", message);
    });
    //deliveredAllMessageAfterReconnect -To all users
    socket.on("deliveredAllMessageAfterReconnect", (message) => {
        exports.io.emit("receiveDeliveredAllMessageAfterReconnect", message);
    });
    // Handle typing
    socket.on("startTyping", (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.isGroupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "typing", data.groupChatId, data);
        }
        else {
            socket.to(data.receiverId).emit("typing", data);
        }
    }));
    // Handle stop typing
    socket.on("stopTyping", (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.isGroupChat) {
            yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "stopTyping", data.groupChatId, data);
        }
        else {
            socket.to(data.receiverId).emit("stopTyping", data);
        }
    }));
    //groupCreatedNotify
    socket.on("groupCreatedNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "groupCreatedNotifyReceived", data.chatId, data);
    }));
    //singleChat createdNitify
    socket.on("chatCreatedNotify", (data) => {
        socket.to(data.to).emit("chatCreatedNotifyReceived", data);
    });
    //singlechatDeletedNotify
    socket.on("singleChatDeletedNotify", (data) => {
        const receiverId = (0, exports.getSocketConnectedUser)(data.receiverId);
        if (receiverId) {
            socket
                .to(receiverId === null || receiverId === void 0 ? void 0 : receiverId.socketId)
                .emit("singleChatDeletedNotifyReceived", { chatId: data.chatId });
        }
    });
    //leave from group chat
    socket.on("groupChatLeaveNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const leaveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
            chatId: data.chatId,
            user: data.currentUser,
            message: `${data.currentUser.name} Leave from the group`,
        });
        const leaveData = Object.assign(Object.assign({}, leaveMessage.toObject()), { user: data.currentUser, chatId: data.chatId });
        yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "groupChatLeaveNotifyReceived", data.chatId, leaveData);
    }));
    //chat blocked notify
    //singlechatDeletedNotify
    socket.on("chatBlockedNotify", (data) => {
        const receiverId = (0, exports.getSocketConnectedUser)(data.receiverId);
        if (receiverId) {
            socket.to(receiverId === null || receiverId === void 0 ? void 0 : receiverId.socketId).emit("chatBlockedNotifyReceived", data);
        }
    });
    //group events
    // userRemoveFromGroupNotify
    socket.on("userRemoveFromGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const userRemoveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
            chatId: data.chatId,
            user: data.currentUser._id,
            message: `${data.currentUser.name} remove ${data.user.name}  from the group`,
        });
        const userRemoveData = {
            message: Object.assign({}, userRemoveMessage.toObject()),
            user: data.user,
            chatId: data.chatId,
        };
        yield (0, groupSocket_1.emitEventToGroupUsers)(exports.io, "userRemoveFromGroupNotifyReceived", data.chatId, userRemoveData);
    }));
    // makeAdminToGroupNotify
    socket.on("makeAdminToGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const makeAdminMessage = yield (0, functions_1.sentGroupNotifyMessage)({
            chatId: data.chatId,
            user: data.currentUser._id,
            message: `${data.currentUser.name} added ${data.user.name} as  group admin`,
        });
        const makeAdminData = {
            message: Object.assign({}, makeAdminMessage.toObject()),
            user: data.user,
            chatId: data.chatId,
        };
        yield (0, groupSocket_1.emitEventToGroupUsers)(exports.io, "makeAdminToGroupNotifyReceived", data.chatId, makeAdminData);
    }));
    // adminRemoveFromGroupNotify
    socket.on("adminRemoveFromGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const adminRemoveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
            chatId: data.chatId,
            user: data.currentUser._id,
            message: `${data.currentUser.name} removed ${data.user.name} from  group admin`,
        });
        const adminRemoveData = {
            message: Object.assign({}, adminRemoveMessage.toObject()),
            user: data.user,
            chatId: data.chatId,
        };
        yield (0, groupSocket_1.emitEventToGroupUsers)(exports.io, "adminRemoveFromGroupNotifyReceived", data.chatId, adminRemoveData);
    }));
    //@@@@@@ calling system end
    // Handle client disconnection
    socket.on("disconnect", (data) => __awaiter(void 0, void 0, void 0, function* () {
        // Emit the updated users array after a user disconnects
        //only send online users notify there who connected with me
        const leaveId = (0, exports.getSocketConnectedUser)(socket.id);
        if (leaveId) {
            socket.leave(leaveId.id);
        }
        const chats = yield ChatModel_1.Chat.find({ users: { $elemMatch: { $eq: leaveId === null || leaveId === void 0 ? void 0 : leaveId.id } } });
        chats === null || chats === void 0 ? void 0 : chats.forEach((chatUsers) => {
            chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.users.forEach((userId) => {
                const receiverId = (0, exports.getSocketConnectedUser)(userId.toString());
                if (receiverId) {
                    const { id, socketId } = receiverId;
                    exports.io.to(socketId).emit("leaveOnlineUsers", {
                        id: leaveId === null || leaveId === void 0 ? void 0 : leaveId.id,
                        socketId: socket.id,
                    });
                }
            });
        });
        //remove from users array
        yield removeUser(socket.id);
        console.log("Client disconnected");
    }));
});
// Start the server
const PORT = process.env.PORT || 5000;
(0, connectDb_1.default)();
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
