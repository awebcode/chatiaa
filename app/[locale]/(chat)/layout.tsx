import { MessageContextProvider } from "@/context/MessageContext";
import React, { ReactNode } from "react";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return <MessageContextProvider>{children}</MessageContextProvider>;
};

export default ChatLayout;
