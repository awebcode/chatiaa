// MessageContext.tsx
"use client";
import React, { useReducer, ReactNode } from "react";
import {
  MessageDispatchContext,
  MessageStateContext,
  messageReducer,
} from "./reducers/messageReducer";
import { State } from "./reducers/interfaces";
import { useContextSelector } from "use-context-selector";
import { getDecryptedSelectedChat } from "@/config/EncDecrypt";

// Initialize initialChats as an array of IChat

const initialState: State = {
  selectedChat: getDecryptedSelectedChat("process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!"),
  isSelectedChat: null,
  messages: [],
  user: null,
  totalMessagesCount: 0,
  totalChats: 0,
  chats: [], //initialChats.length > 0 ? initialChats :
  callInfo: null,
};

export const MessageContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  return (
    <MessageStateContext.Provider value={state}>
      <MessageDispatchContext.Provider value={dispatch}>
        {children}
      </MessageDispatchContext.Provider>
    </MessageStateContext.Provider>
  );
};

export const useMessageState = () => {
  const context = useContextSelector(MessageStateContext, (v) => v);
  if (context === undefined) {
    throw new Error("useMessageState must be used within a MessageProvider");
  }
  return context;
};

export const useMessageDispatch = () => {
  const context = useContextSelector(MessageDispatchContext, (v) => v);
  if (context === undefined) {
    throw new Error("useMessageDispatch must be used within a MessageProvider");
  }
  return context;
};
