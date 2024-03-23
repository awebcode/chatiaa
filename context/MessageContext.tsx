// MessageContext.tsx
"use client";
import React, {
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  MessageDispatchContext,
  MessageStateContext,
  messageReducer,
} from "./reducers/messageReducer";
import { fetchClientUser } from "@/functions/authActions";
import { SET_USER } from "./reducers/actions";
import { State } from "./reducers/interfaces";
import { useSession } from "next-auth/react";
import { Tuser } from "@/store/types";

const initialState: State = {
  selectedChat:null,
  messages: [],
  user: null,
  totalMessagesCount: 0,
  totalChats:0,
  chats:[]
};

export const MessageContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { data: session } = useSession();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser:any = localStorage.getItem("currentUser");
        if (currentUser && session?.user?.email && session?.user?.email===currentUser.email) {
          dispatch({ type: SET_USER, payload: JSON.parse(currentUser) });
        } else {
          const user = await fetchClientUser();
          dispatch({ type: SET_USER, payload: user });
          localStorage.setItem("currentUser", JSON.stringify(user));
        }
      } catch (error: any) {
        throw new Error(error);
      }
    };

    fetchUser();
  }, [dispatch, session]);

  return (
    <MessageStateContext.Provider value={state}>
      <MessageDispatchContext.Provider value={dispatch}>
        {children}
      </MessageDispatchContext.Provider>
    </MessageStateContext.Provider>
  );
};

export const useMessageState = () => {
  const context = useContext(MessageStateContext);
  if (context === undefined) {
    throw new Error("useMessageState must be used within a MessageProvider");
  }
  return context;
};

export const useMessageDispatch = () => {
  const context = useContext(MessageDispatchContext);
  if (context === undefined) {
    throw new Error("useMessageDispatch must be used within a MessageProvider");
  }
  return context;
};
