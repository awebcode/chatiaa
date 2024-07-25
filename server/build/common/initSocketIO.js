"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIoInstance = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
        // Handle your Socket.IO events here
        socket.on("chat message", (msg) => {
            console.log(`Received message: ${msg}`);
            io.emit("chat message", msg); // Broadcast to all clients
        });
    });
};
exports.initializeSocket = initializeSocket;
const getIoInstance = () => {
    if (!io) {
    }
    return io;
};
exports.getIoInstance = getIoInstance;
