import { createContext, Dispatch } from "react";
import { SET_SELECTED_CHAT, SET_MESSAGES, SET_USER, CLEAR_MESSAGES, SET_TOTAL_MESSAGES_COUNT } from "./actions";
import { Action, State } from "./interfaces";

export const MessageStateContext = createContext<State | undefined>(undefined);
export const MessageDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);

export const messageReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
    case SET_MESSAGES:
      let updatedMessages;
      //&&
      // state.selectedChat?.chatId === action.payload[0]?.chat?._id;
      if (Array.isArray(action.payload)) {
        updatedMessages = [...state.messages, ...action.payload];
      } else {
        updatedMessages = [action.payload,...state.messages, ];
      }
      return { ...state, messages: updatedMessages };
    case CLEAR_MESSAGES: {
      return { ...state, messages: [] };
    }
    case CLEAR_MESSAGES: {
      return { ...state, messages: [] };
    }
    case SET_TOTAL_MESSAGES_COUNT: {
       return { ...state, totalMessagesCount: action.payload };
      }
    default:
      return state;
  }
};
