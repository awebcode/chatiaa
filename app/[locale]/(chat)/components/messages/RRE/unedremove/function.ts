import { REMOVE_UNSENT_MESSAGE } from "@/context/reducers/actions";
import {
  updateMessageStatusAsRemove,
  updateMessageStatusAsUnsent,
} from "@/apisActions/messageActions";
import { Tuser } from "@/store/types";
import { Socket } from "socket.io-client";

export const unsent_remove_Message_function = async (
  dispatch?: any,
  socket?: Socket,
  data?: {
    status: string;
    messageId: string;
    updatedBy?: Tuser | null;
    isGroupChat?: boolean;
    chatId?: string;
    receiverId?: string;
  }
) => {
  if (dispatch && data?.status !== "unsent") {
    dispatch({
      type: REMOVE_UNSENT_MESSAGE,
      payload: data,
    });
  }
  if (socket && data?.status !== "unsent") {
    socket.emit("remove_remove_All_unsentMessage", data);
  }
  if (data?.status === "unsent") {
    try {
      const res = await updateMessageStatusAsUnsent(data as any);
      if (dispatch && socket) {
        dispatch({
          type: REMOVE_UNSENT_MESSAGE,
          payload: data,
        });
        socket.emit("remove_remove_All_unsentMessage", data);
      }

      return res;
    } catch (error) {
      return error;
    }
  } else {
    try {
      const res = await updateMessageStatusAsRemove(data as any);
      return res;
    } catch (error) {
      return error;
    } // Assuming this is a fallback function
  }
};
