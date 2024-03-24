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
import { useRouter } from "@/navigation";
import { toast } from "react-toastify";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import {
  BLOCK_CHAT,
  DELETE_CHAT,
  LEAVE_CHAT,
  SET_SELECTED_CHAT,
  UPDATE_CHAT_STATUS,
} from "@/context/reducers/actions";

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
        user
      });
    },
  });
};

export const useDeleteSingleChatMutation = (chatId: string, onChat: boolean) => {
  const { socket } = useSocketContext();
  const { selectedChat } = useMessageState();
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
  const { selectedChat,user:currentUser } = useMessageState();
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
///remove from greoup or leave group

export const useRemoveFromGroup = () => {
  const queryClient = useQueryClient();
  const { selectedChat } = useMessageState();
  const dispatch = useMessageDispatch();
  const Router = useRouter();
  return useMutation({
    mutationFn: (removeData: { chatId: string; userId: string }) =>
      removeFromGroup(removeData),
    onSuccess: (data) => {
      // Assuming selectedChat is stored in a global state using setSelectedChat
      // If not, modify this part accordingly
      dispatch({
        type: SET_SELECTED_CHAT,
        payload: { ...selectedChat, users: data.data.users },
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      if (data.isAdminLeave) {
        Router.push("/Chat");
      }
    },
  });
};

///make admin

export const useMakeAdmin = () => {
  const queryClient = useQueryClient();
  const { selectedChat } = useMessageState();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: (addData: { chatId: string; userId: string }) => makeAsAdmin(addData),
    onSuccess: (data) => {
      console.log({ makeAdmin: data.data });
      // Assuming selectedChat is stored in a global state using setSelectedChat
      // If not, modify this part accordingly
      dispatch({
        type: SET_SELECTED_CHAT,
        payload: { ...selectedChat, groupAdmin: data.data.groupAdmin },
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

///remove from admin

export const useRemoveFromAdmin = () => {
  const queryClient = useQueryClient();
  const { selectedChat } = useMessageState();
  const dispatch = useMessageDispatch();
  return useMutation({
    mutationFn: (removeData: { chatId: string; userId: string }) =>
      removeFromAdmin(removeData),
    onSuccess: (data) => {
      // Assuming selectedChat is stored in a global state using setSelectedChat
      // If not, modify this part accordingly
      dispatch({
        type: SET_SELECTED_CHAT,
        payload: { ...selectedChat, groupAdmin: data.data.groupAdmin },
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
