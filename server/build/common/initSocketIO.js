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
};
exports.initializeSocket = initializeSocket;
const getIoInstance = () => {
    if (!io) {
    }
    return io;
};
exports.getIoInstance = getIoInstance;
