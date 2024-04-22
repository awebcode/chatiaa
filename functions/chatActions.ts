import { axiosClient } from "@/config/AxiosConfig";
import { BaseUrl } from "@/config/BaseUrl";
import axios from "axios";
export const accessChats = async (userId: any) => {
  //body users and group name
  const { data } = await axiosClient.post(`/accessChats/${userId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
export const getChats = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/fetchChats?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
//create group

export const createGroup = async (data: any) => {
  const { data: groupData } = await axiosClient.post(`/group`, data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return groupData;
};

//updateGroupNamePhoto
export const updateGroupNamePhoto = async (dataGroup: FormData) => {
  const { data } = await axiosClient.put(`/updateGroupNamePhoto`, dataGroup, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

//remove
export const removeFromGroup = async (removeData: { chatId: string; userId: string }) => {
  const { data } = await axiosClient.put(`/removefromgroup`, removeData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//addTo group
export const addToGroup = async (addData: any) => {
  const { data } = await axiosClient.put(`/addTogroup`, addData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
//make as admin
export const makeAsAdmin = async (adminData: { chatId: string; userId: string }) => {
  const { data } = await axiosClient.put(`/makeAdmin`, adminData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
//remove from admin
export const removeFromAdmin = async (removeData: { chatId: string; userId: string }) => {
  const { data } = await axiosClient.put(`/removefromAdmin`, removeData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//Delete Single Chat
export const deleteSingleChat = async (id: string) => {
  const { data } = await axiosClient.delete(`/deleteSingleChat/${id}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//leave from group Chat
export const leaveChat = async (chatId: string, userId: string) => {
  const { data } = await axiosClient.put(
    `/leaveChat`,
    { chatId, userId },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return data;
};

//getInitialFilesInChat

//leave from group Chat
export const getInitialFilesInChat = async (chatId: string) => {
  const { data } = await axiosClient.get(`/getInitialFilesInChat/${chatId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
//getFilesInChat

export const getFilesInChat = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/getFilesInChat/${queryKey[0]}?filter=${
      queryKey[1]
    }&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};

//getUsers in a chat
export const getUsersInAChat = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/getUsersInAChat/${queryKey[0]}?search=${
      queryKey[1]
    }&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};


//deleteAllMessagesInAChat

//leave from group Chat
export const deleteAllMessagesInAChat = async (chatId: string) => {
  const { data } = await axiosClient.delete(`/deleteAllMessagesInAChat/${chatId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};