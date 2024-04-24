// MessageContext.tsx
"use client";
import React, { useReducer, ReactNode, useEffect, useMemo } from "react";
import {
  MessageDispatchContext,
  MessageStateContext,
  messageReducer,
} from "./reducers/messageReducer";
import { State } from "./reducers/interfaces";
import { useContextSelector } from "use-context-selector";
const initialState: State = {
  selectedChat:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("selectedChat") || "null")
      : null,
  isSelectedChat: null,
  messages: [],
  user: null,
  totalMessagesCount: 0,
  totalChats: 0,
  chats:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("chats") as any) || []
      : [],
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
