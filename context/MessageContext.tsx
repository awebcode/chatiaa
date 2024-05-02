// MessageContext.tsx
"use client";
import React, { useReducer, ReactNode, useEffect, useMemo } from "react";
import {
  MessageDispatchContext,
  MessageStateContext,
  messageReducer,
} from "./reducers/messageReducer";
import { IChat, State } from "./reducers/interfaces";
import { useContextSelector } from "use-context-selector";

// Initialize initialChats as an array of IChat
let initialChats: IChat[] = [];

// Check if window is defined (in case of SSR) and session storage is supported
if (typeof window !== "undefined") {
  const storedChats = localStorage.getItem("chats");

  // Check if storedChats is not null and has at least one chat item with an _id property
  if (storedChats) {
    const parsedChats = JSON.parse(storedChats);
    if (Array.isArray(parsedChats) && parsedChats.length > 0) {
      initialChats = parsedChats;
    }
  }
}

const initialState: State = {
  selectedChat:
    typeof window !== "undefined" && window.localStorage
      ? JSON.parse(localStorage.getItem("selectedChat") || "null")
      : null,
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
