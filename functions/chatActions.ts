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
  console.log({queryKey})
  const { data } = await axios.get(
    `${BaseUrl}/fetchChats?search=${
      queryKey[1]
    }&skip=${pageParam}&limit=${10}`,
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

//rename
export const renameGroup = async (dataGroup: { chatId: string; chatName: string }) => {
  const { data } = await axiosClient.put(`/rename`, dataGroup, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//remove
export const removeFromGroup = async (removeData: { chatId:string,userId:string}) => {
  const { data } = await axiosClient.put(`/removefromgroup`,removeData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

//addTo group
export const addToGroup = async (addData: any) => {
  const { data } = await axiosClient.put(`/addTogroup/`,addData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
//make as admin
export const makeAsAdmin = async (adminData: { chatId:string,userId:string}) => {
  const { data } = await axiosClient.put(`/makeAdmin`,adminData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
//remove from admin
export const removeFromAdmin = async (removeData: { chatId:string,userId:string}) => {
  const { data } = await axiosClient.put(`/removefromAdmin`,removeData, {
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
