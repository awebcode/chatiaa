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
exports.socketINIT = void 0;
//?socketIO cluster modules
const os_1 = require("os");
const sticky_1 = require("@socket.io/sticky"); // Import for sticky session management
const cluster_adapter_1 = require("@socket.io/cluster-adapter"); // Import for cluster adapter
const cluster_1 = __importDefault(require("cluster"));
const initSocketIO_1 = require("./common/initSocketIO");
const http_1 = require("http");
const ChatModel_1 = require("./model/ChatModel");
const UserModel_1 = require("./model/UserModel");
const functions_1 = require("./controllers/functions");
const groupSocket_1 = require("./common/groupSocket");
const checkIsOnline_1 = require("./common/checkIsOnline");
const socketINIT = (app) => {
    //@@ configuring server with cluster load balancer
    const PORT = process.env.PORT || 5000;
    let numCPUs = process.env.NODE_ENV === "production" ? Math.max((0, os_1.cpus)().length / 2, 1) : 1;
    if (cluster_1.default.isPrimary) {
        console.log(`Master ${process.pid} is running`);
        const httpServer = (0, http_1.createServer)();
        // setup sticky sessions
        (0, sticky_1.setupMaster)(httpServer, {
            loadBalancingMethod: "round-robin",
        });
        // setup connections between the workers
        (0, cluster_adapter_1.setupPrimary)();
        // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
        // Node.js < 16.0.0
        cluster_1.default.setupPrimary({
            serialization: "json", //set this for json data sent to another socket
        });
        httpServer.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
        for (let i = 0; i < numCPUs; i++) {
            cluster_1.default.fork();
        }
        cluster_1.default.on("exit", (worker) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster_1.default.fork();
        });
    }
    else {
        //@ Setting socket io cluster adapters
        const httpServer = (0, http_1.createServer)(app);
        (0, initSocketIO_1.initializeSocket)(httpServer); //* initialize the Socket.IO instance
        const io = (0, initSocketIO_1.getIoInstance)();
        // use the cluster adapter
        io.adapter((0, cluster_adapter_1.createAdapter)());
        // setup connection with the primary process
        (0, sticky_1.setupWorker)(io);
        // WebSocket server logic
        io.on("connection", (socket) => {
            //join in group chat
            socket.on("join", (data) => {
                socket.join(data.chatId);
                io.emit("join", data.chatId);
            });
            //single
            socket.on("setup", (userData) => __awaiter(void 0, void 0, void 0, function* () {
                socket.join(userData.userId);
                yield (0, checkIsOnline_1.checkOnlineUsers)(userData.userId, socket.id);
                //store connected users
                // Filtered users from chats
                const chatUsers = yield ChatModel_1.Chat.find({ users: userData.userId });
                // Iterate through chat users and add online users to alreadyConnectedOnlineUsers
                yield Promise.all(chatUsers.map((chatUser) => __awaiter(void 0, void 0, void 0, function* () {
                    yield Promise.all(chatUser.users.map((chatUserId) => __awaiter(void 0, void 0, void 0, function* () {
                        const receiverId = yield (0, checkIsOnline_1.getSocketConnectedUser)(chatUserId.toString());
                        if (receiverId) {
                            const { userId } = receiverId;
                            const id = userId.toString(); // Convert userId to string
                            io.to(id).emit("addOnlineUsers", {
                                chatId: chatUser._id,
                                userId: userData.userId,
                                socketId: socket.id,
                                userInfo: yield UserModel_1.User.findById(userData.userId).select("name image lastActive"), ///new adduserdata send to others connected friends
                            });
                        }
                    })));
                })));
                // Emit the event only if there are connected users
                // if (alreadyConnectedOnlineUsers.length > 0) {
                //   socket.emit("alreadyConnectedOnlineUsers", alreadyConnectedOnlineUsers);
                // }
                // io.emit("setup", users);
                console.log("Client connected", socket.id);
            }));
            // Handle incoming messages from clients
            socket.on("sentMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
                // Broadcast the message to all connected clients
                const data = yield (0, functions_1.sentSocketTextMessage)({
                    chat: message.chatId,
                    sender: message.senderId,
                    content: message.content,
                    tempMessageId: message.tempMessageId,
                });
                if (message.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(io, "receiveMessage", message.chatId, data);
                    //  socket.emit("receiveMessage", message);
                }
                else {
                    //all connected clients in room
                    //  io.to(message.chatId)
                    //    .to(message.receiverId)
                    //    .emit("receiveMessage", {
                    //      ...message,
                    //      receiverId: message.receiverId,
                    //      chat: { _id: message.chatId },
                    //    });
                    // console.log({data})
                    io.to(message.chatId)
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
                    io.to(message.receiverId).emit("remove_remove_All_unsentMessage", message);
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
            socket.on("deliveredAllMessageAfterReconnect", (data) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, groupSocket_1.markMessageAsDeliverdAfteronlineFriend)(socket, data.userId);
            }));
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
            socket.on("singleChatDeletedNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const receiverId = yield (0, checkIsOnline_1.getSocketConnectedUser)(data.receiverId);
                if (receiverId) {
                    socket.to(receiverId === null || receiverId === void 0 ? void 0 : receiverId.socketId).emit("singleChatDeletedNotifyReceived", data);
                }
            }));
            //leave from group chat
            socket.on("groupChatLeaveNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const leaveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: data.chatId,
                    user: data.currentUser,
                    message: `${(_a = data === null || data === void 0 ? void 0 : data.currentUser) === null || _a === void 0 ? void 0 : _a.name} Leave from the group`,
                });
                const leaveData = Object.assign(Object.assign({}, leaveMessage.toObject()), { user: data.currentUser, chatId: data.chatId });
                yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "groupChatLeaveNotifyReceived", data.chatId, leaveData);
            }));
            //chat blocked notify
            //singlechatDeletedNotify
            socket.on("chatBlockedNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const receiverId = yield (0, checkIsOnline_1.getSocketConnectedUser)(data.receiverId);
                if (receiverId) {
                    socket.to(receiverId === null || receiverId === void 0 ? void 0 : receiverId.socketId).emit("chatBlockedNotifyReceived", data);
                }
            }));
            //group events
            // userRemoveFromGroupNotify
            socket.on("userRemoveFromGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const userRemoveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: data.chatId,
                    user: data.currentUser,
                    message: `${data.currentUser.name} remove ${data.user.name}  from the group`,
                });
                const userRemoveData = {
                    message: Object.assign({}, userRemoveMessage.toObject()),
                    user: data.user,
                    chatId: data.chatId,
                };
                yield (0, groupSocket_1.emitEventToGroupUsers)(io, "userRemoveFromGroupNotifyReceived", data.chatId, userRemoveData);
            }));
            // makeAdminToGroupNotify
            socket.on("makeAdminToGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const makeAdminMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: data.chatId,
                    user: data.currentUser,
                    message: `${data.currentUser.name} added ${data.user.name} as  group admin`,
                });
                const makeAdminData = {
                    message: Object.assign({}, makeAdminMessage.toObject()),
                    user: data.user,
                    chatId: data.chatId,
                };
                yield (0, groupSocket_1.emitEventToGroupUsers)(io, "makeAdminToGroupNotifyReceived", data.chatId, makeAdminData);
            }));
            // adminRemoveFromGroupNotify
            socket.on("adminRemoveFromGroupNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const adminRemoveMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: data.chatId,
                    user: data.currentUser,
                    message: `${data.currentUser.name} removed ${data.user.name} from  group admin`,
                });
                const adminRemoveData = {
                    message: Object.assign({}, adminRemoveMessage.toObject()),
                    user: data.user,
                    chatId: data.chatId,
                };
                yield (0, groupSocket_1.emitEventToGroupUsers)(io, "adminRemoveFromGroupNotifyReceived", data.chatId, adminRemoveData);
            }));
            // Handle seenPushGroupMessage
            socket.on("seenPushGroupMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "seenPushGroupMessageReceived", data.chatId, data);
            }));
            //deliveredGroupMessageReceived
            socket.on("deliveredGroupMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "deliveredGroupMessageReceived", data === null || data === void 0 ? void 0 : data.chatId, data);
            }));
            ///deletedAllMessageInChatNotify
            socket.on("deletedAllMessageInChatNotify", (data) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "deletedAllMessageInChatNotify", data.chatId, data);
            }));
            //update_group_info
            socket.on("update_group_info", (data) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "update_group_info_Received", data._id, data);
            }));
            //calling system start
            socket.on("sent_call_invitation", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                if (data.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "received_incoming_call", data.chatId, data);
                    //  socket.emit("receiveMessage", message);
                }
                else {
                    //all connected clients in room
                    socket.to((_b = data.receiver) === null || _b === void 0 ? void 0 : _b._id).emit("received_incoming_call", Object.assign({}, data));
                }
            }));
            //accept call
            socket.on("call_accepted", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _c;
                //all connected clients in room
                socket.to((_c = data.receiver) === null || _c === void 0 ? void 0 : _c._id).emit("user:call_accepted", Object.assign({}, data));
            }));
            //reject call
            socket.on("call_rejected", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _d;
                //all connected clients in room
                socket.to((_d = data.receiver) === null || _d === void 0 ? void 0 : _d._id).emit("user:call_rejected", Object.assign({}, data));
            }));
            //caller_call_rejected
            socket.on("caller_call_rejected", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _e;
                //all connected clients in room
                if (data.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "caller_call_rejected_received", data.chatId, data);
                    //  socket.emit("receiveMessage", message);
                }
                else {
                    //all connected clients in room
                    socket
                        .to((_e = data.receiver) === null || _e === void 0 ? void 0 : _e._id)
                        .emit("caller_call_rejected_received", Object.assign({}, data));
                }
            }));
            //update:on-call-count
            socket.on("update:on-call-count", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _f;
                const foundChat = yield ChatModel_1.Chat.findById(data.chatId);
                //all connected clients in room
                if (foundChat === null || foundChat === void 0 ? void 0 : foundChat.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "update:on-call-count_received", data.chatId, data);
                    //  socket.emit("receiveMessage", message);
                }
                else {
                    // Populate users field if it's not already populated
                    const receiver = yield (foundChat === null || foundChat === void 0 ? void 0 : foundChat.populate("users", "name email image lastActive"));
                    //all single user
                    (_f = receiver === null || receiver === void 0 ? void 0 : receiver.users) === null || _f === void 0 ? void 0 : _f.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
                        const isConnected = yield (0, checkIsOnline_1.getSocketConnectedUser)(user === null || user === void 0 ? void 0 : user._id.toString());
                        if (isConnected) {
                            io.to(isConnected === null || isConnected === void 0 ? void 0 : isConnected.socketId).emit("update:on-call-count_received", Object.assign({}, data));
                        }
                    }));
                }
            }));
            //user-on-call-message
            socket.on("user-on-call-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _g;
                const foundChat = yield ChatModel_1.Chat.findById(data.chatId);
                const userOncallMessage = yield (0, functions_1.sentGroupNotifyMessage)({
                    chatId: data.chatId,
                    user: data.user,
                    message: data.message,
                    type: data.type === "call-notify" ? "call-notify" : "notify",
                });
                const userOncallData = {
                    message: Object.assign({}, userOncallMessage.toObject()),
                    user: data.user,
                    chatId: data.chatId,
                };
                //all connected clients in room
                if (foundChat === null || foundChat === void 0 ? void 0 : foundChat.isGroupChat) {
                    yield (0, groupSocket_1.emitEventToGroupUsers)(socket, "user-on-call-message_received", data.chatId, userOncallData);
                    //  socket.emit("receiveMessage", message);
                }
                else {
                    // Populate users field if it's not already populated
                    const receiver = yield (foundChat === null || foundChat === void 0 ? void 0 : foundChat.populate("users", "name email image lastActive"));
                    //all single user
                    (_g = receiver === null || receiver === void 0 ? void 0 : receiver.users) === null || _g === void 0 ? void 0 : _g.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
                        const isConnected = yield (0, checkIsOnline_1.getSocketConnectedUser)(user === null || user === void 0 ? void 0 : user._id.toString());
                        if (isConnected) {
                            io.to(isConnected === null || isConnected === void 0 ? void 0 : isConnected.socketId).emit("user-on-call-message_received", Object.assign({}, userOncallData));
                        }
                    }));
                }
            }));
            //@@@@@@ calling system end
            // Handle client disconnection
            // Keep track of disconnected sockets
            socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const leaveId = yield (0, checkIsOnline_1.getSocketConnectedUser)(socket.id);
                    if (leaveId) {
                        socket.leave(leaveId.userId.toString());
                        const userId = leaveId.userId.toString();
                        // Emit leave user event to online users
                        const eventData = {
                            userId: userId,
                            socketId: socket.id,
                        };
                        yield (0, groupSocket_1.emitEventToOnlineUsers)(io, "leaveOnlineUsers", userId, eventData);
                        // Remove the user from the database
                        console.log("Client disconnected:", socket.id);
                    }
                }
                catch (error) {
                    console.error("Error handling disconnection:", error);
                }
            }));
        });
        // Start the server
        // const PORT = process.env.PORT || 5000;
        // connectDb();
        // app.use(notFoundHandler);
        // app.use(errorHandler);
        // server.listen(PORT, () => {
        //   console.log(`Server is listening on port ${PORT}`);
        // });
    }
    //> Errors handlers
};
exports.socketINIT = socketINIT;
