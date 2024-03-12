import { axiosClient } from "@/config/AxiosConfig";
import { BaseUrl } from "@/config/BaseUrl";
import axios from "axios";

//all Messages
export const allMessages = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
  }) => {
  const chatId = queryKey[1];
  console.log({chatId})
  if (chatId === undefined) {
     
     // Handle the case where chatId is undefined
     return { data: [], prevOffset: 0, skip: 0 };
   }

    const { data } = await axios.get(
      `${BaseUrl}/allMessages/${chatId}?skip=${pageParam}&limit=${10}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return { ...data, prevOffset: pageParam, skip: pageParam };
  
};
// export const allMessages = async (chatId: string) => {
//   const { data } = await axiosClient.get(`/allMessages/${chatId}`, {
//     headers: { "Content-Type": "application/json" },
//     withCredentials: true,
//   });
//   const messages = data.messages;
//   return messages;
// };
//sent message
export const sentMessage = async (body: any) => {
  const { data } = await axiosClient.post(`/sentMessage`, body, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

type TupdateStatus = {
  chatId: string;
  status: string;
};

//update  message status
export const updateMessageStatus = async (body: TupdateStatus) => {
  const { data } = await axiosClient.patch(`/updateMessageStatus`, body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status
export const updateAllMessageStatusAsSeen = async (chatId: string) => {
  const { data } = await axiosClient.put(`/updateMessageStatusSeen/${chatId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status as Delivered after reconnect
export const updateAllMessageStatusAsDelivered = async (userId: string) => {
  const { data } = await axiosClient.put(`/updateMessageStatusDelivered/${userId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status as Remove
export const updateAllMessageStatusAsRemove = async (userData: any) => {
  const { data } = await axiosClient.put(`/updateMessageStatusRemove`, userData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update all  message status as Unsent
export const updateAllMessageStatusAsUnsent = async (userData: any) => {
  const { data } = await axiosClient.put(`/updateMessageStatusUnsent`, userData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//update chat status as Block/Unblock
export const updateChatStatusAsBlockOUnblock = async (userData: any) => {
  const { data } = await axiosClient.put(`/updateChatStatusAsBlockOUnblock`, userData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//ReplyMessage
export const replyMessage = async (messageData: any) => {
  const { data } = await axiosClient.post(`/replyMessage`, messageData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

//editMessage
export const editMessage = async (messageData: any) => {
  const { data } = await axiosClient.put(`/editMessage`, messageData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

//addRemoveEmojiReactions

export const addRemoveEmojiReactions = async (reactionData: any) => {
  const { data } = await axiosClient.post(`/addRemoveEmojiReactions`, reactionData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
