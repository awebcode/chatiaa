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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, dotenv_1.config)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
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
const getUser = (id) => {
    return users.find((user) => user.id === id);
};
// WebSocket server logic
io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData.id);
        checkOnlineUsers(userData.id, socket.id);
        io.emit("setup", users);
        console.log("Client connected");
    });
    socket.on("join", (data) => {
        socket.join(data.chatId);
        io.emit("join", data.chatId);
    });
    // Handle incoming messages from clients
    socket.on("sentMessage", (message) => {
        // Broadcast the message to all connected clients
        if (message.isGroupChat) {
            io.to(message.groupChatId).emit("receiveMessage", message);
            //  socket.emit("receiveMessage", message);
        }
        else {
            //all connected clients in room
            socket.to(message.receiverId).emit("receiveMessage", message);
            socket.emit("receiveMessage", message);
        }
    });
    //deliveredMessage
    socket.on("deliveredMessage", (message) => {
        socket.broadcast.to(message.receiverId).emit("receiveDeliveredMessage", message);
    });
    //deliveredAllMessageAfterReconnect -To all users
    socket.on("deliveredAllMessageAfterReconnect", (message) => {
        io.emit("receiveDeliveredAllMessageAfterReconnect", message);
    });
    // Handle typing
    socket.on("startTyping", (data) => {
        if (data.isGroupChat) {
            socket.to(data.groupChatId).emit("typing", data);
        }
        else {
            socket.in(data.receiverId).emit("typing", data);
        }
    });
    // Handle stop typing
    socket.on("stopTyping", (data) => {
        if (data.isGroupChat) {
            socket.to(data.groupChatId).emit("stopTyping", data);
        }
        else {
            socket.in(data.receiverId).emit("stopTyping", data);
        }
    });
    //@@@@@@ calling system start
    socket.on("user:call", ({ to, offer, user, chatId }) => {
        io.to(to).emit("incomming:call", { from: user._id, offer, user, chatId }); //from=socket.id prev
    });
    socket.on("call:rejected", ({ to, user }) => {
        io.to(to).emit("call:rejected", { from: user._id, user });
    });
    socket.on("call:accepted", ({ to, ans, user }) => {
        // console.log({ to, ans, user });
        io.to(to).emit("call:accepted", { from: user._id, ans });
    });
    socket.on("peer:nego:needed", ({ to, offer, user }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: user._id, offer, user });
    });
    socket.on("peer:nego:done", ({ to, ans, user }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: user._id, ans });
    });
    //groupCreatedNotify
    socket.on("groupCreatedNotify", (data) => {
        data.forEach((userId) => {
            socket.to(userId).emit("groupCreatedNotifyReceived");
        });
    });
    //singleChat createdNitify
    socket.on("chatCreatedNotify", (data) => {
        console.log({ chatCreatedNotify: data });
        socket.to(data.to).emit("chatCreatedNotifyReceived");
    });
    //chatDeletedNotify
    socket.on("chatDeletedNotify", (data) => {
        data.forEach((userId) => {
            socket.to(userId).emit("chatDeletedNotifyReceived");
        });
    });
    //@@@@@@ calling system end
    // Handle client disconnection
    socket.on("disconnect", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield removeUser(socket.id);
        // Emit the updated users array after a user disconnects
        io.emit("setup", users);
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
