import { useSocketContext } from "@/context/SocketContextProvider";
import {
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
  DELETE_CHAT,
  LEAVE_CHAT,
  MAKE_AS_ADMIN_TO_GROUP_CHAT,
  REMOVE_ADMIN_FROM_GROUP_CHAT,
  REMOVE_USER_FROM_GROUP,
  SET_SELECTED_CHAT,
} from "@/context/reducers/actions";
import { Tuser } from "@/store/types";

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
  const { socket } = useSocketContext();
   const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => deleteSingleChat(chatId),
    onSuccess: (data) => {
      toast.success("Chat deleted successfully!");
      if (onChat || chatId === selectedChat?.chatId) {
        dispatch({
          type: SET_SELECTED_CHAT,
          payload: [],
        });
      }
      dispatch({
        type: DELETE_CHAT,
        payload: { chatId },
      });

      socket.emit("singleChatDeletedNotify", {
        chatId,
        receiverId: data.receiverId,
      });
    },
  });
};

//leave chat
export const useLeaveChatMutation = (chatId: string, userId: string) => {
  const { socket } = useSocketContext();
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => leaveChat(chatId, userId),
    onSuccess: (data) => {
      toast.success("You Leave from the chat!");
      if (chatId === selectedChat?.chatId) {
        dispatch({
          type: SET_SELECTED_CHAT,
          payload: [],
        });
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

export const useUserRemoveFromGroup = (chatId: string, user:Tuser) => {
   const { selectedChat, user: currentUser } = useMessageState();
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: () => removeFromGroup({ chatId, userId:user._id }),
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
