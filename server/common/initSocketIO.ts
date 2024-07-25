import { Server as SocketIOServer } from "socket.io";
import http from "http";

let io: SocketIOServer;

const initializeSocket = (httpServer: http.Server): void => {
  io = new SocketIOServer(httpServer, {
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

const getIoInstance = (): SocketIOServer => {
  if (!io) {
    
  }
  return io;
};

export { initializeSocket, getIoInstance };
