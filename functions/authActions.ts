import { axiosClient } from "@/config/AxiosConfig";

export const registerUser = async (formdata: any) => {
  try {
    const { data } = await axiosClient.post("/register", formdata, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    return data;
  } catch (error: any) {
    return error;
  }
};

export const loginUser = async (formdata: any) => {
  const { data } = await axiosClient.post("/login", formdata, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

export const getAllUsers = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/getUsers?search=${queryKey[1]}&skip=${pageParam}&limit=${10}&onGroupSearch=${
      queryKey[2] ? true : false
    }`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
//allUsersForAddgroupExclueWhoinAlreadyChat
export const allUsersForAddgroupExclueWhoinAlreadyChat = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/allUsersForAddgroupExclueWhoinAlreadyChat/${queryKey[0]}?search=${
      queryKey[1]
    }&skip=${pageParam}&limit=${10}
    `,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
//get alll admin users

export const getAllAdminUsers = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/allAdminUsers?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};
//logout user
export const logoutUser = async () => {
  const res = await axiosClient.post(`/logout`, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
//get profile
export const getProfile = async (userId: string) => {
  const { data } = await axiosClient.get(`/getProfile/${userId}`, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  return data;
};
//fetchClientUser

export const fetchClientUser = async () => {
  const { data } = await axiosClient.get(`/getUser`, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  return data;
};
////delete user by admin or authorized user
export const deleteUserByAdmin = async (userId: string) => {
  const { data } = await axiosClient.delete(`/deleteUserByAdmin/${userId}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

////updateUser by admin or authorized user
export const updateUser = async (dataUser: FormData) => {
  const { data } = await axiosClient.put(`/updateUser`, dataUser, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

///getOnlineUsersInMyChats

export const getOnlineUsers = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axiosClient.get(
    `/getOnlineUsersInMyChats?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};

//updateOncallMembers

export const updateOnCallMembers = async (dataupdate: {chatId:string,type:string}) => {
  const { data } = await axiosClient.put(`/updateOncallMembers`, dataupdate, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};
