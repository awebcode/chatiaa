import { Server as SocketIOServer } from "socket.io";
import http from "http";

let io: SocketIOServer;

const initializeSocket = (httpServer: http.Server): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

};

const getIoInstance = (): SocketIOServer => {
  if (!io) {
    
  }
  return io;
};

export { initializeSocket, getIoInstance };
