import { useSocketContext } from "@/context/SocketContextProvider";
import { addRemoveEmojiReactions } from "@/functions/messageActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {useMessageState}from "@/context/MessageContext"
export const useAddRemoveReactionMutation = () => {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
   const { selectedChat,user:currentUser } = useMessageState();
  return useMutation({
    mutationFn: (reactionData: any) => addRemoveEmojiReactions(reactionData),
    onSuccess: (data) => {
      toast.success("React added successfully!");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      socket.emit("sentMessage", {
        senderId: currentUser?._id,
        receiverId: selectedChat?.userInfo?._id,
      });
    },
  });
};
