import { createContext, Dispatch } from "react";
import {
  SET_SELECTED_CHAT,
  SET_MESSAGES,
  SET_USER,
  CLEAR_MESSAGES,
  SET_TOTAL_MESSAGES_COUNT,
  SET_CHATS,
  UPDATE_MESSAGE_STATUS,
  UPDATE_CHAT_STATUS,
  UPDATE_LATEST_CHAT_MESSAGE,
  UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND,
  REMOVE_UNSENT_MESSAGE,
} from "./actions";
import { Action, State } from "./interfaces";
import {
  ADD_REPLY_MESSAGE,
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
} from "./actions";
export const MessageStateContext = createContext<State | undefined>(undefined);
export const MessageDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);

export const messageReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };

    // set chats start
    case SET_CHATS:
      let updatedChats;
      if (Array.isArray(action.payload.chats)) {
        if (action.payload.onScrollingData) {
          //when scroll
          updatedChats = [...state.chats, ...action.payload.chats];
        } else {
          updatedChats = action.payload.chats;
        }
      } else {
        updatedChats = [action.payload, ...state.chats];
      }
      return { ...state, chats: updatedChats, totalChats: action.payload.total };
    //UPDATE_CHAT_STATUS
    case UPDATE_CHAT_STATUS:
      return {
        ...state,
        // Update chats array to replace the existing message with the edited one
        chats: state.chats.map((chat) =>
          chat._id === action.payload.chatId
            ? {
                ...chat,
                latestMessage: {
                  ...(chat.latestMessage as any),
                  status: action.payload.status,
                },
              }
            : chat
        ),
      };

    //UPDATE_LATEST_CHAT_MESSAGE
    case UPDATE_LATEST_CHAT_MESSAGE:
      // Find the index of the chat being updated
      const updatedChatIndex = state.chats.findIndex(
        (chat) => chat._id === action.payload.chat._id
      );

      // If the chat is not found, return state as is
      if (updatedChatIndex === -1) {
        return state;
      }

      // Update the chat message and unseen count
      const updatedChat = {
        ...state.chats[updatedChatIndex],
        latestMessage: action.payload,
        unseenCount: (state.chats[updatedChatIndex].unseenCount || 0) + 1,
      };

      // Remove the chat from its current position
      const newUpdatedChats = state.chats.filter(
        (chat) => chat._id !== action.payload.chat._id
      );

      // Add the updated chat at the beginning
      newUpdatedChats.unshift(updatedChat);

      return {
        ...state,
        chats: newUpdatedChats,
      };

    // set chats end
    //selected chat start
    case SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
    //selected chat end
    case SET_MESSAGES:
      let updatedMessages;
      //&&
      // state.selectedChat?.chatId === action.payload[0]?.chat?._id;
      if (Array.isArray(action.payload)) {
        updatedMessages = [...state.messages, ...action.payload];
      } else {
        updatedMessages = [action.payload, ...state.messages];
      }
      return { ...state, messages: updatedMessages };
    case SET_TOTAL_MESSAGES_COUNT:
      return {
        ...state,
        totalMessagesCount: action.payload,
      };
    //UPDATE MESSAGE STATUS
    case UPDATE_MESSAGE_STATUS:
      return {
        ...state,
        // Update messages array to replace the existing message with the edited one
        messages: state?.messages?.map((message) =>
          // Check if message.type is "seenAll", if so, update status of all messages
          action.payload.type === "seenAll"
            ? { ...message, status: action.payload.status }
            : // Otherwise, update status of a specific message identified by messageId
            message._id === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message
        ),
      };

    case UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND:
      return {
        ...state,
        // Update messages array to replace the existing message with the edited one
        chats: state?.chats?.map((chat) =>
          chat.latestMessage?.sender._id === action.payload.senderId
            ? { ...chat, status: "delivered" }
            : chat
        ),
      };
    case CLEAR_MESSAGES: {
      return { ...state, messages: [] };
    }

    case ADD_REPLY_MESSAGE:
      return {
        ...state,
        // Update messages array to include the new reply message
        messages: [action.payload, ...state.messages],
      };
    // Handle adding edited message
    case ADD_EDITED_MESSAGE:
      return {
        ...state,
        // Update messages array to replace the existing message with the edited one
        messages: state?.messages?.map((message) =>
          message._id === action.payload._id ? action.payload : message
        ),
      };

    //reaction add/remove/update handler
    case ADD_REACTION_ON_MESSAGE:
      return {
        ...state,
        // Update messages array based on message type
        messages: state.messages.map((message) => {
          if (message._id === action.payload.reaction.messageId) {
            // If the message ID matches, update the reactions
            if (action.payload.type === "add") {
              // For add type, add the new reaction and update the reactionsGroup
              const updatedReactions = [action.payload.reaction, ...message.reactions];
              let updatedReactionsGroup = [...message.reactionsGroup]; // Create a copy of the original reactionsGroup

              // Find the index of the emoji in reactionsGroup
              const emojiIndex = updatedReactionsGroup.findIndex(
                (emoji) => emoji._id === action.payload.reaction.emoji
              );

              if (emojiIndex !== -1) {
                // If the emoji already exists, increment its count
                updatedReactionsGroup[emojiIndex] = {
                  ...updatedReactionsGroup[emojiIndex],
                  count: updatedReactionsGroup[emojiIndex].count + 1,
                };
              } else {
                // If the emoji doesn't exist, add a new entry
                updatedReactionsGroup.push({
                  _id: action.payload.reaction.emoji,
                  count: 1,
                });
              }

              return {
                ...message,
                totalReactions: message.totalReactions + 1,
                reactions: updatedReactions,
                reactionsGroup: updatedReactionsGroup,
              };
            } else if (action.payload.type === "update") {
              // For update type, replace the existing reaction with the updated one
              const updatedReactions = message.reactions.map((reaction) =>
                reaction._id === action.payload.reaction._id
                  ? action.payload.reaction // Replace the existing reaction with the updated one
                  : reaction
              );

              let updatedReactionsGroup = [...message.reactionsGroup]; // Create a copy of the original reactionsGroup

              if (updatedReactionsGroup.length === 1) {
                // If there's only one emoji in reactionsGroup, replace it with the new emoji
                updatedReactionsGroup = [
                  {
                    _id: action.payload.reaction.emoji,
                    count: 1,
                  },
                ];
              } else {
                // Update reactionsGroup if the emoji of the updated reaction has changed
                updatedReactionsGroup = updatedReactionsGroup.map((emoji) =>
                  emoji._id === action.payload.reaction.emoji
                    ? { ...emoji, count: emoji.count - 1 } // Decrement count for old emoji
                    : emoji
                );

                // Find the index of the updated reaction's emoji in reactionsGroup
                const updatedEmojiIndex = updatedReactionsGroup.findIndex(
                  (emoji) => emoji._id === action.payload.reaction.emoji
                );

                if (updatedEmojiIndex !== -1) {
                  // If the emoji exists in reactionsGroup, increment its count
                  updatedReactionsGroup[updatedEmojiIndex].count++;
                } else {
                  const findExisting = message.reactions.find(
                    (user) => user.reactBy?._id === action.payload.reaction?.reactBy?._id
                  );

                  const updatedEmojiIndex = updatedReactionsGroup.findIndex(
                    (emoji) => emoji._id === findExisting?.emoji
                  );
                  // If the emoji doesn't exist, add a new entry
                  if (findExisting) {
                    if (updatedEmojiIndex !== -1) {
                      updatedReactionsGroup[updatedEmojiIndex]._id =
                        action.payload.reaction.emoji;
                    }
                  }
                }
              }

              return {
                ...message,
                reactions: updatedReactions,
                reactionsGroup: updatedReactionsGroup,
              };
            } else if (action.payload.type === "remove") {
              // For remove type, filter out the removed reaction and update the reactionsGroup
              const updatedReactions = message.reactions.filter(
                (reaction) => reaction._id !== action.payload.reaction._id
              );
              // Filter out emojis with count === 1 before mapping
              let updatedReactionsGroup;
              if (message.reactions.length < 3) {
                updatedReactionsGroup = message.reactionsGroup.filter(
                  (emoji) => emoji._id !== action.payload.reaction.emoji
                ); // Filter out emojis with count === 1
              }
              return {
                ...message,
                totalReactions: message.totalReactions - 1,
                reactions: updatedReactions,
                reactionsGroup: updatedReactionsGroup as any,
              };
            }
          }
          return message;
        }),
      };

    // Handle remove/unsent/removefromall/reback removed message
    case REMOVE_UNSENT_MESSAGE:
      return {
        ...state,
        // Update messages array to replace the existing message with the edited one
        messages:
          action.payload.status === "removed"
            ? state?.messages?.map((message) =>
                message?._id === action.payload.messageId
                  ? {
                      ...message,
                      status: "removed",
                      updatedAt: Date.now().toString(),
                      removedBy: action.payload.updatedBy,
                    }
                  : message
              )
            : action.payload.status === "removeFromAll"
            ? state.messages.filter((message) => message._id !== action.payload.messageId)
            : action.payload.status === "reBack"
            ? state?.messages?.map((message) =>
                message?._id === action.payload.messageId
                  ? {
                      ...message,
                      status: "reBack",
                      updatedAt: Date.now().toString(),
                      removedBy: action.payload.updatedBy,
                    }
                  : message
              )
            : action.payload.status === "unsent"
            ? state?.messages?.map((message) =>
                message?._id === action.payload.messageId
                  ? {
                      ...message,
                      status: "unsent",
                      content: "unsent",
                      updatedAt: Date.now().toString(),

                      removedBy: action.payload.updatedBy,
                    }
                  : message
              )
            : state.messages,
      };

    default:
      return state;
  }
};
