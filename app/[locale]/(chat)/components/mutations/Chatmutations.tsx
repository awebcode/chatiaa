import { useSocketContext } from "@/context/SocketContextProvider";
import {
  accessChats,
  deleteAllMessagesInAChat,
  deleteSingleChat,
  leaveChat,
  makeAsAdmin,
  removeFromAdmin,
  removeFromGroup,
} from "@/functions/chatActions";
import { updateChatStatusAsBlockOUnblock } from "@/functions/messageActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import {
  BLOCK_CHAT,
  CLEAR_MESSAGES,
  DELETE_ALL_MESSAGE_IN_CHAT,
  DELETE_CHAT,
  LEAVE_CHAT,
  MAKE_AS_ADMIN_TO_GROUP_CHAT,
  REMOVE_ADMIN_FROM_GROUP_CHAT,
  REMOVE_USER_FROM_GROUP,
  SET_CHATS,
  SET_SELECTED_CHAT,
} from "@/context/reducers/actions";
import { Tuser } from "@/store/types";
import { getSenderFull } from "../logics/logics";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useRouter } from "@/navigation";
//useAccessChats mutation

export const useAccessChatMutation = (closeDialogId: string) => {
  const { user: currentUser } = useMessageState();
  const router = useRouter();
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const addOnlineUser = useOnlineUsersStore((s) => s.addOnlineUser);
  return useMutation({
    mutationFn: (data) => accessChats(data),

    onSuccess: (chat) => {
      console.log({ createdChat: chat });
      dispatch({ type: CLEAR_MESSAGES });
      const isFriend = getSenderFull(currentUser, chat.chatData?.users);
      const chatData = {
        _id: chat?.chatData?._id,
        chatId: chat?.chatData?._id,
        latestMessage: chat?.chatData?.latestMessage,
        chatCreatedAt: chat?.chatData?.createdAt,

        groupChatName: chat?.chatData?.chatName,
        isGroupChat: chat?.chatData?.isGroupChat,
        groupAdmin: chat?.chatData?.groupAdmin,
        chatStatus: chat?.chatData?.chatStatus,
        users: chat?.chatData?.isGroupChat ? chat?.chatData?.users : null,
        userInfo: {
          name: !chat?.chatData?.isGroupChat ? isFriend?.name : chat?.chatData?.chatName,
          email: !chat?.chatData?.isGroupChat ? isFriend?.email : "",
          _id: !chat?.chatData?.isGroupChat ? isFriend?._id : chat?.chatData?._id,
          image: !chat?.chatData?.isGroupChat ? isFriend?.image : "/vercel.svg",
          lastActive: !chat?.chatData?.isGroupChat ? isFriend?.lastActive : "",
          createdAt: !chat?.chatData?.isGroupChat
            ? isFriend?.createdAt
            : chat?.chatData?.createdAt,
        } as any,
        groupInfo: {
          description: (chat?.chatData as any)?.description,
          image: { url: (chat?.chatData as any)?.image?.url },
        },
        isOnline: chat?.chatData?.isOnline,
        onCallMembers: chat?.chatData?.onCallMembers,
      };
      // setSelectedChat(chatData as any);
      dispatch({ type: SET_SELECTED_CHAT, payload: chatData });
      localStorage.setItem("selectedChat", JSON.stringify(chatData));
      router.push(`/chat/${chat.chatData?._id}`);
      if (chat?.isNewChat) {
        dispatch({ type: SET_CHATS, payload: chat.chatData });
        if (chat?.chatData?.isOnline) {
          const onlineUserData = {
            userId: isFriend?._id,
            chatId: chat.chatData?._id,
            userInfo: isFriend,
            socketId: "",
          };
          addOnlineUser(onlineUserData);
        }

        socket.emit("chatCreatedNotify", {
          to: isFriend?._id,
          chat: chat.chatData,
          chatId: chat.chatData?._id,
        });
      }

      document.getElementById(closeDialogId)?.click();
      // setIsOpen(false);
    },
  });
};
export const useBlockMutation = () => {
  const { selectedChat, user } = useMessageState();
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  return useMutation({
    mutationFn: (data: any) => updateChatStatusAsBlockOUnblock(data),
    onSuccess: (data) => {
      dispatch({
        type: BLOCK_CHAT,
        payload: { user: user, chatId: data.chatId }, //data.chat.chatBlockedBy
      });

      socket.emit("chatBlockedNotify", {
        receiverId: data.receiverId,
        chatId: data.chatId,
        user,
      });
    },
  });
};

export const useDeleteSingleChatMutation = (chatId: string, onChat: boolean) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { socket } = useSocketContext();
  const removeOnlineUser = useOnlineUsersStore((s) => s.removeOnlineUser);
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => deleteSingleChat(chatId),
    onSuccess: (data) => {
      toast.success("Chat deleted successfully!");
      if (onChat || chatId === selectedChat?.chatId) {
        dispatch({ type: CLEAR_MESSAGES });
        dispatch({
          type: SET_SELECTED_CHAT,
          payload: null,
        });
        localStorage.removeItem("selectedChat");
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.replace("/chat");
      }
      dispatch({
        type: DELETE_CHAT,
        payload: { chatId },
      });
      removeOnlineUser({ userId: data.receiverId } as any);
      socket.emit("singleChatDeletedNotify", {
        chatId,
        receiverId: data.receiverId,
      });
    },
  });
};

//leave chat
export const useLeaveChatMutation = (chatId: string, userId: string) => {
  const router = useRouter();
  const { socket } = useSocketContext();
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveChat(chatId, userId),
    onSuccess: (data) => {
      toast.success("You Leave from the chat!");
      if (chatId === selectedChat?.chatId) {
        dispatch({ type: CLEAR_MESSAGES });
        dispatch({
          type: SET_SELECTED_CHAT,
          payload: null,
        });
        dispatch({
          type: LEAVE_CHAT,
          payload: { chatId },
        });
        localStorage.removeItem("selectedChat");
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.replace("/chat");
      }
      dispatch({
        type: LEAVE_CHAT,
        payload: { chatId },
      });
      if (data.chat.isGroupChat) {
        socket.emit("groupChatLeaveNotify", { chatId, userId, currentUser });
      }
    },
  });
};

///remove user from group

export const useUserRemoveFromGroup = (chatId: string, user: Tuser) => {
  const { selectedChat, user: currentUser } = useMessageState();
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => removeFromGroup({ chatId, userId: user._id }),
    onSuccess: (data) => {
      // Assuming selectedChat is stored in a global state using setSelectedChat
      // If not, modify this part accordingly
      dispatch({
        type: REMOVE_USER_FROM_GROUP,
        payload: { chatId, user },
      });

      socket.emit("userRemoveFromGroupNotify", {
        chatId,
        user,
        currentUser,
      });
    },
  });
};

///make admin to group

export const useMakeAdmin = (chatId: string, user: Tuser) => {
  const { selectedChat, user: currentUser } = useMessageState();
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => makeAsAdmin({ chatId, userId: user._id }),
    onSuccess: (data) => {
      dispatch({
        type: MAKE_AS_ADMIN_TO_GROUP_CHAT,
        payload: { chatId, user },
      });
      socket.emit("makeAdminToGroupNotify", {
        chatId,
        user,
        currentUser,
      });
    },
  });
};

///remove  admin from group

export const useRemoveAdminFromGroup = (chatId: string, user: Tuser) => {
  const { selectedChat, user: currentUser } = useMessageState();
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => removeFromAdmin({ chatId, userId: user._id }),
    onSuccess: (data) => {
      // Assuming selectedChat is stored in a global state using setSelectedChat
      // If not, modify this part accordingly
      dispatch({
        type: REMOVE_ADMIN_FROM_GROUP_CHAT,
        payload: { chatId, user },
      });
      socket.emit("adminRemoveFromGroupNotify", {
        chatId,
        user,
        currentUser,
      });
    },
  });
};

//delete all messages in chat

export const useDeleteAllMessagesInAChatMutation = (chatId: string) => {
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => deleteAllMessagesInAChat(chatId),
    onSuccess: (data) => {
      toast.success("All messages deleted successfully!");
      dispatch({
        type: DELETE_ALL_MESSAGE_IN_CHAT,
        payload: { chatId },
      });

      socket.emit("deletedAllMessageInChatNotify", {
        chatId,
      });
    },
  });
};
