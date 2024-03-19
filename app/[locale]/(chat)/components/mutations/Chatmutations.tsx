import { useSocketContext } from "@/context/SocketContextProvider";
import {
  deleteSingleChat,
  makeAsAdmin,
  removeFromAdmin,
  removeFromGroup,
} from "@/functions/chatActions";
import { updateChatStatusAsBlockOUnblock } from "@/functions/messageActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/navigation";
import { toast } from "react-toastify";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { SET_SELECTED_CHAT } from "@/context/reducers/actions";

export const useBlockMutation = () => {
    const queryClient = useQueryClient();
    const { selectedChat } = useMessageState();
    const dispatch = useMessageDispatch();

  return useMutation({
    mutationFn: (data: any) => updateChatStatusAsBlockOUnblock(data),
    onSuccess: (data) => {
      console.log({ data });
      toast.success(data.status);
     
        dispatch({
          type: SET_SELECTED_CHAT,
          payload: {
            ...selectedChat,
            status: data.status,
            chatUpdatedBy: { _id: data.updatedBy },
          },
        });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteSingleChatMutation = (chatId: string, onChat: boolean) => {
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
 const { selectedChat } = useMessageState();
  const router = useRouter();
  return useMutation({
    mutationFn: () => deleteSingleChat(chatId),
    onSuccess: (data) => {
      toast.success("Chat deleted successfully!");
      if (onChat || chatId === selectedChat?.chatId) {
        router.push("/chat");
      }
    
      socket.emit("chatDeletedNotify", data.users);
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
            type: SET_SELECTED_CHAT, payload: { ...selectedChat, users: data.data.users }
        })
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
