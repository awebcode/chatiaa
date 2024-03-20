import { createContext, Dispatch } from "react";
import {
  SET_SELECTED_CHAT,
  SET_MESSAGES,
  SET_USER,
  CLEAR_MESSAGES,
  SET_TOTAL_MESSAGES_COUNT,
} from "./actions";
import { Action, State } from "./interfaces";
import {
  ADD_REPLY_MESSAGE,
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
  REMOVE_MESSAGE,
  REMOVE_FROM_ALL,
  UNSENT_MESSAGE,
} from "./actions";
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
        updatedMessages = [action.payload, ...state.messages];
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
        messages: state.messages.map((message) =>
          message._id === action.payload._id ? action.payload : message
        ),
      };
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
                  // If the emoji doesn't exist, add a new entry
                  updatedReactionsGroup.push({
                    _id: action.payload.reaction.emoji,
                    count: 1,
                  });
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
              const updatedReactionsGroup = message.reactionsGroup
                .filter((emoji) => emoji.count !== 1) // Filter out emojis with count === 1
                .map((emoji) => {
                  if (emoji._id === action.payload.reaction.emoji) {
                    // If the emoji matches, decrement the count
                    return { ...emoji, count: Math.max(0, emoji.count - 1) };
                  }
                  return emoji;
                });

              return {
                ...message,
                reactions: updatedReactions,
                reactionsGroup: updatedReactionsGroup,
              };
            }
          }
          return message;
        }),
      };

    // Handle removing message
    case REMOVE_MESSAGE:
      return {
        ...state,
        // Update messages array to exclude the removed message
        messages: state.messages.filter((message) => message._id !== action.payload),
      };
    // Handle removing message from all
    case REMOVE_FROM_ALL:
      return {
        ...state,
        // Update messages array to exclude messages removed from all
        messages: state.messages.filter(
          (message) => !action.payload.includes(message._id)
        ),
      };
    // Handle unsent message
    case UNSENT_MESSAGE:
      return {
        ...state,
        // Update messages array to exclude unsent message
        messages: state.messages.filter((message) => message._id !== action.payload),
      };
    default:
      return state;
  }
};
