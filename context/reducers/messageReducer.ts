import { Dispatch } from "react";
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
  DELETE_CHAT,
  LEAVE_CHAT,
  BLOCK_CHAT,
  LEAVE_FROM_GROUP_CHAT,
  REMOVE_ADMIN_FROM_GROUP_CHAT,
  MAKE_AS_ADMIN_TO_GROUP_CHAT,
  REMOVE_USER_FROM_GROUP,
  SET_GROUP_USERS_ON_FETCHING,
  SEEN_PUSH_USER_GROUP_MESSAGE,
  UPDATE_GROUP_INFO,
} from "./actions";
import { Action, State } from "./interfaces";
import {
  ADD_REPLY_MESSAGE,
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
} from "./actions";
import { createContext } from "use-context-selector";
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
        //when new chat created new chat
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
        (chat) => chat._id === action.payload.chat._id || action.payload.chatId
      );
      console.log({ UPDATE_LATEST_CHAT_MESSAGE: action.payload });

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
        (chat) => chat._id !== action.payload.chat._id || action.payload.chatId
      );

      // Add the updated chat at the beginning
      newUpdatedChats.unshift(updatedChat);

      return {
        ...state,
        chats: newUpdatedChats,
        messages: state.messages.map((message) =>
          message._id === action.payload._id || action.payload.messageId
            ? {
                ...message,

                status: action.payload.status,
              }
            : message
        ),
      };
    //delete and leave chat
    case DELETE_CHAT:
    case LEAVE_CHAT:
      return {
        ...state,
        // Filter out the chat with the specified chatId
        chats: state.chats.filter((chat) => chat._id !== action.payload.chatId),
      };
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
    ////BLOCK_CHAT
    case BLOCK_CHAT:
      return {
        ...state,
        // Update chats array to replace the existing message with the edited one
        chats: state.chats.map((chat) =>
          chat._id === action.payload.chatId
            ? {
                ...chat,
                // Check if the user is already in the group admin array
                chatBlockedBy: chat.chatBlockedBy.some(
                  (user) => user._id === action.payload.user._id
                )
                  ? chat.chatBlockedBy.filter(
                      (user) => user._id !== action.payload.user._id
                    ) // If yes, remove them
                  : [...chat.chatBlockedBy, action.payload.user],
              }
            : chat
        ),
        //update if current blocked chat is selected chat
        selectedChat:
          state.selectedChat && state.selectedChat.chatId === action.payload.chatId
            ? {
                ...state.selectedChat,
                chatBlockedBy: state.selectedChat.chatBlockedBy.some(
                  (user) => user._id === action.payload.user._id
                )
                  ? state.selectedChat.chatBlockedBy.filter(
                      (user) => user._id !== action.payload.user._id
                    )
                  : [...state.selectedChat.chatBlockedBy, action.payload.user],
              }
            : null,
      };
    //LEAVE_FROM_GROUP_CHAT
    case LEAVE_FROM_GROUP_CHAT:
      return {
        ...state,
        // Update chats array to replace the existing message with the edited one
        chats: state.chats.map((chat) =>
          chat._id === action.payload.chatId
            ? {
                ...chat,
                // Check if the user is already in the group admin array
                users: chat.users.filter((user) => user._id !== action.payload.user._id), // If yes, remove them
              }
            : chat
        ),
        //update if current leave chat is selected chat
        selectedChat:
          state.selectedChat && state.selectedChat.chatId === action.payload.chatId
            ? null
            : state.selectedChat,
      };
    //MAKE_AS_ADMIN_TO_GROUP_CHAT
    case MAKE_AS_ADMIN_TO_GROUP_CHAT:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            return {
              ...chat,
              groupAdmin: chat.groupAdmin
                ? chat.groupAdmin.some((user) => user._id === action.payload.user._id)
                  ? chat.groupAdmin
                  : [...chat.groupAdmin, action.payload.user]
                : chat.groupAdmin,
            };
          }
          return chat;
        }),
        selectedChat:
          state.selectedChat && state.selectedChat.groupAdmin
            ? {
                ...state.selectedChat,
                groupAdmin: state.selectedChat.groupAdmin.some(
                  (user) => user._id === action.payload.user._id
                )
                  ? state.selectedChat.groupAdmin
                  : [...state.selectedChat.groupAdmin, action.payload.user],
              }
            : state.selectedChat,
      };
    //REMOVE_ADMIN_FROM_GROUP_CHAT
    case REMOVE_ADMIN_FROM_GROUP_CHAT:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            const updatedGroupAdmin = (chat.groupAdmin || []).filter(
              (user) => user._id !== action.payload.user._id
            );
            return {
              ...chat,
              groupAdmin: updatedGroupAdmin.length ? updatedGroupAdmin : undefined,
            };
          }
          return chat;
        }),
        selectedChat: state.selectedChat
          ? {
              ...state.selectedChat,
              groupAdmin: (state.selectedChat.groupAdmin || []).filter(
                (u) => u._id !== action.payload.user._id
              ),
            }
          : state.selectedChat,
      };
    //REMOVE_USER_FROM_GROUP_CHAT AS A ADMIN
    case REMOVE_USER_FROM_GROUP:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            const updatedGroupUsers = (chat.users || []).filter(
              (user) => user._id !== action.payload.user._id
            );
            return {
              ...chat,
              users: updatedGroupUsers,
            };
          }
          return chat;
        }),
        selectedChat: state.selectedChat
          ? {
              ...state.selectedChat,
              users: (state.selectedChat.users || []).filter(
                (u) => u._id !== action.payload.user._id
              ),
            }
          : state.selectedChat,
      };
    ///SEEN_PUSH_USER_GROUP_MESSAGE
    case SEEN_PUSH_USER_GROUP_MESSAGE:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            // Check if latestMessage exists and seenBy is an array
            const updatedSeenBy = chat.latestMessage?.seenBy || [];

            // Check if the user is already in the seenBy array
            const isUserSeen = updatedSeenBy.some(
              (u) => u._id === action.payload.user._id
            );

            // If the user is not already in the seenBy array, add them
            if (!isUserSeen) {
              updatedSeenBy.push(action.payload.user);
            }

            return {
              ...chat,
              latestMessage: {
                ...(chat.latestMessage as any),
                status: "seen",
                seenBy: updatedSeenBy,
                isSeen: action.payload?.currentUser ? true : false,
              },
            };
          }
          return chat;
        }),
        messages: state.messages.map((message) => {
          let updated = message.seenBy || [];

          if (
            message.seenBy?.some(
              (u: any) =>
                u?._id === action.payload.user._id ||
                (u?._id && u?.userId?._id === action.payload.user._id)
            )
          ) {
            updated = (message.seenBy || []).filter(
              (u: any) =>
                u?._id !== action.payload.user._id &&
                (!u._id || u?.userId?._id !== action.payload.user._id)
            );
          }

          if (message._id === action.payload.messageId) {
            // Check if latestMessage exists and seenBy is an array
            const updatedSeenBy = updated;

            // Check if the user is already in the seenBy array
            const isUserSeen = updatedSeenBy.some(
              (u) => u._id === action.payload.user._id
            );

            // If the user is not already in the seenBy array, add them
            if (!isUserSeen) {
              updatedSeenBy.push(action.payload.user);
            }

            return {
              ...message,
              status: "seen",
              seenBy: updatedSeenBy,
              isSeen: true,
            };
          }
          return { ...message, status: "seen", seenBy: updated };
        }),
      };

    // set chats end
    //selected chat start
    case SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload, isSelectedChat: action.payload };
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
    // clear messages
    case CLEAR_MESSAGES: {
      return {
        ...state,
        messages: [],
        
      };
    }
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
          chat.latestMessage?.sender?._id === action.payload.senderId
            ? { ...chat, status: "delivered" }
            : chat
        ),
      };

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
            const updatedReactions = Array.isArray(message.reactions)
              ? [...message.reactions]
              : [];
            if (action.payload.type === "add") {
              updatedReactions.unshift(action.payload.reaction); // Add the new reaction to the beginning of the array
              let updatedReactionsGroup = Array.isArray(message.reactionsGroup)
                ? [...message.reactionsGroup]
                : [];

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
    //update group UPDATE_GROUP_INFO

    case UPDATE_GROUP_INFO:
      console.log({UPDATE_GROUP_INFO:action.payload})
      return {
        ...state,
        chats: state?.chats?.map((chat) =>
          chat?._id === action.payload._id
            ? {
                ...chat,
                chatName: action.payload.chatName,
                image: action.payload.image,
                groupInfo: {
                  description: action.payload.description,
                  image: action.payload.image,
                },
              }
            : chat
        ),
        selectedChat:
          state?.selectedChat && state?.selectedChat?.chatId === action.payload._id
            ? {
                ...state?.selectedChat,
                chatName: action.payload.chatName,
                groupInfo: {
                  description: action.payload.description,
                  image: action.payload.image,
                },
              }
            : state?.selectedChat,
      };
    default:
      return state;
  }
};
