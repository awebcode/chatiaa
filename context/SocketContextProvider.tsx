"use client";
// SocketContextProvider.tsx
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { Socket, io, SocketOptions } from "socket.io-client";

interface SocketContextType {
  socket: Socket;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketContextProvider");
  }
  return context;
};

interface SocketContextProviderProps {
  children: ReactNode;
}

const SocketContextProvider = ({ children }: SocketContextProviderProps) => {
  const socketOptions: SocketOptions = {}; // You can customize socket options if needed
  const socket: Socket = useMemo(
    () =>
      io(
        process.env.NODE_ENV === "production"
          ? "https://chatiaa-server.onrender.com"
          : "http://localhost:5000",
        {
          ...socketOptions,transports: ["websocket"],autoConnect:true
        }
      ),
    [socketOptions]
  );

  const contextValue: SocketContextType = {
    socket,
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export default SocketContextProvider;
