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
  LEAVE_ONLINE_USER,
  UPDATE_ONLINE_STATUS,
  SENT_CALL_INVITATION,
  REJECT_CALL,
  ACCEPT_CALL,
  USER_CALL_ACCEPTED,
  USER_CALL_REJECTED,
  CLEAR_CALL,
  RECEIVE_CALL_INVITATION,
  UPDATE_ON_CALL_COUNT,
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
                isSeen: !action.payload?.isSocketData && true,
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
        const existingMessageIndex = state.messages.findIndex((m) => {
          if (m.tempMessageId === action.payload.tempMessageId) {
            return true;
          }
          if (action.payload.isEdit && m._id === action.payload.isEdit?.messageId?._id) {
            return true;
          }

          return m._id === action.payload._id;
        });
        //  console.log({payload:action.payload})
        if (existingMessageIndex !== -1) {
          // Update the existing message
          updatedMessages = [...state.messages];
          const { isEdit, file, content, createdAt } = action.payload;
          if (
            ["editMessage", "editSocketMessage"].includes(action.payload.addMessageType)
          ) {
            //add editmessage
            updatedMessages[existingMessageIndex] = {
              ...updatedMessages[existingMessageIndex],
              isEdit,
              file,
              content:
                action.payload.addMessageType === "editSocketMessage"
                  ? content
                  : isEdit.messageId.content,
              createdAt,
            };
          } else {
            updatedMessages[existingMessageIndex] = action.payload;
          }
        } else {
          // Add the new message to the messages array
          if (action.payload.addMessageType !== "editMessage") {
            updatedMessages = [action.payload, ...state.messages];
          } //
        }
      }
      return { ...state, messages: updatedMessages as any };
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
          chat?._id === action.payload.chatId
            ? {
                ...chat,
                latestMessage: { ...(chat.latestMessage as any), status: "delivered" },
              }
            : chat
        ),
        messages: state?.messages?.map((message) =>
          message.chat._id === action.payload.chatId
            ? { ...message, status: "delivered" }
            : message
        ),
      };

    case ADD_REPLY_MESSAGE:
      const existingMessageIndex = state.messages.findIndex((m) => {
        return m.tempMessageId === action.payload.tempMessageId;
      });

      let updatedReplyMessages;
        console.log({replyaction:action.payload})

      if (existingMessageIndex !== -1) {
        // If the message exists, update it
        updatedReplyMessages = [...state.messages];
        updatedReplyMessages[existingMessageIndex] = action.payload;
      } else {
        // If the message doesn't exist, prepend the new reply message to the messages array
        updatedReplyMessages = [action.payload, ...state.messages];
      }

      return {
        ...state,
        messages: updatedReplyMessages,
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
          if (message._id === action.payload.reaction?.messageId) {
            // If the message ID matches, update the reactions
            const updatedReactions = Array.isArray(message.reactions)
              ? [...message.reactions]
              : [];

            let totalReactions = message.totalReactions || 1;
            const existingReactionIndex = updatedReactions.findIndex(
              (m) => m.tempReactionId === action.payload.reaction.tempReactionId
            );
            //&&
            if (action.payload.type === "add" && !updatedReactions.find(
                (u) => u.reactBy._id === action.payload.reaction.reactBy._id
              )?._id) { ///if tempreactionId but no id exists then
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
                  count:
                    existingReactionIndex !== -1
                      ? updatedReactionsGroup[emojiIndex].count
                      : updatedReactionsGroup[emojiIndex].count + 1,
                };
              } else {
                // If the emoji doesn't exist, add a new entry
                if (
                  !updatedReactions.some(
                    (u) => u.reactBy._id === action.payload.reaction.reactBy._id
                  )
                ) {
                  updatedReactionsGroup.push({
                    _id: action.payload.reaction.emoji,
                    count: 1,
                  });
                }
              }
              //updatedReactions
              if (existingReactionIndex !== -1) {
                updatedReactions[existingReactionIndex] = action.payload.reaction; // just update when id available bcz previously sender updated ui
              } else {
                totalReactions + 1;
                updatedReactions.unshift(action.payload.reaction);
              } // Add the new reaction to the beginning of the array}
              return {
                ...message,
                totalReactions,
                reactions: updatedReactions,
                reactionsGroup: updatedReactionsGroup,
              };
            } else if (
              action.payload.type === "update" ||
              updatedReactions.some(
                (u) => u.reactBy._id === action.payload.reaction.reactBy._id
              )
            ) {
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
                totalReactions: totalReactions - 1,
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
      console.log({ UPDATE_GROUP_INFO: action.payload });
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
    //LEAVE_ONLINE_USER and update last active
    case LEAVE_ONLINE_USER:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (!chat.isGroupChat) {
            const userIndex = chat?.users.findIndex(
              (user) => user._id === action.payload.userInfo?.userId
            );
            if (userIndex !== -1) {
              const updatedUsers = [...chat.users];
              updatedUsers[userIndex].lastActive = action.payload.userInfo.lastActive; // Update lastActive
              return {
                ...chat,
                users: updatedUsers,
              };
            }
          }
          return chat;
        }),
        selectedChat:
          state.selectedChat && !state?.selectedChat.isGroupChat
            ? {
                ...state.selectedChat,
                userInfo: {
                  ...state.selectedChat.userInfo,
                  lastActive: action.payload.userInfo.lastActive,
                },
              }
            : state.selectedChat,
      };
    //UPDATE_ONLINE_STATUS
    case UPDATE_ONLINE_STATUS:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            const isOnline =
              action.payload.type === "online"
                ? true
                : !chat.isGroupChat &&
                  action.payload.type === "leave" &&
                  action.payload.userId !== action.payload.currentUser._id
                ? false
                : action.payload.isAnyGroupUserOnline;

            return {
              ...chat,
              isOnline: isOnline,
            };
          }
          return chat;
        }),
        selectedChat:
          state.selectedChat && state.selectedChat.chatId === action.payload.chatId
            ? {
                ...state.selectedChat,
                isOnline:
                  action.payload.type === "online"
                    ? true
                    : action.payload.type === "leave"
                    ? false
                    : state.selectedChat.isOnline,
              }
            : state.selectedChat,
      };
    //@@@@@@@@@@@CALLING MECHANISM

    case SENT_CALL_INVITATION:
      return {
        ...state,
        callInfo: { ...action.payload, isMyCall: true },
      };
    //RECEIVE_CALL_INVITATION

    case RECEIVE_CALL_INVITATION:
      return {
        ...state,
        callInfo: { ...action.payload, isIncomingCall: true },
      };
    //@@@@@@@@@@@ACCEPET CALL

    case ACCEPT_CALL:
      return {
        ...state,
        callInfo: { ...action.payload, isAccept: true },
      };
    //@@@@@@@@@@@REJECT CALL

    case REJECT_CALL:
      return {
        ...state,
        callInfo: null,
      };
    //USER_CALL_ACCEPTED
    case USER_CALL_ACCEPTED:
      return {
        ...state,
        callInfo: {
          ...action.payload,
          isAccepted: true,
          isRejected: false,
          isMyCall: false,
          isIncomingCall: false,
        },
      };
    //USER_CALL_ACCEPTED
    case USER_CALL_REJECTED:
      return {
        ...state,
        callInfo: {
          ...action.payload,
          isAccepted: false,
          isRejected: true,
          isMyCall: false,
          isIncomingCall: false,
        },
      };
    case CLEAR_CALL:
      return {
        ...state,
        callInfo: null,
      };
    //UPDATE_ON_CALL_COUNT
    case UPDATE_ON_CALL_COUNT:
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chatId) {
            return {
              ...chat,
              onCallMembers:
                action.payload.type === "join"
                  ? chat.onCallMembers + 1
                  : chat.onCallMembers - 1,
            };
          }
          return chat;
        }),
        selectedChat:
          state.selectedChat && state.selectedChat.chatId === action.payload.chatId
            ? {
                ...state.selectedChat,
                onCallMembers:
                  action.payload.type === "join"
                    ? state.selectedChat.onCallMembers + 1
                    : state.selectedChat.onCallMembers - 1,
              }
            : state.selectedChat,
      };

    default:
      return state;
  }
};
