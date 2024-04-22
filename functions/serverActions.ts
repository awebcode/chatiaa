"use server";
import { BaseUrl } from "@/config/BaseUrl";
import axios from "axios";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
export const getChatsServerAction = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axios.get(
    `${BaseUrl}/fetchChats?search=${queryKey[1]}&skip=${pageParam}&limit=${10}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `authToken=${
          cookies().get(
            process.env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token"
          )?.value
        };`,
      },
      withCredentials: true,
    }
  );

  return { ...data, prevOffset: pageParam, skip: pageParam };
};

//all messages server action

//all Messages
export const allMessagesServerAction = async ({
  queryKey = "",
  pageParam = 0,
}: {
  pageParam: any;
  queryKey: any;
}) => {
  const { data } = await axios.get(
    `${BaseUrl}/allMessages/${queryKey[1]}?skip=${pageParam}&limit=${8}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `authToken=${
          cookies().get(
            process.env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token"
          )?.value
        };`,
      },
      withCredentials: true,
    }
  );
  return { ...data, prevOffset: pageParam, skip: pageParam };
};

//get user
export const fetchUser = async () => {
  const res = await fetch(`${BaseUrl}/getUser`, {
    credentials: "include",
    next: { tags: ["my-profile"] },
    headers: {
      Cookie: `authToken=${
        cookies().get(
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token"
        )?.value
      };`,
    },
  });
  //__Secure-next-auth.session-token
  return await res.json();
};
//get profile
export const getProfile = async (userId: string) => {
  const res = await fetch(`${BaseUrl}/getProfile/${userId}`, {
    credentials: "include",
    next: { tags: ["user-profile"] },
    headers: {
      Cookie: `authToken=${
        cookies().get(
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token"
        )?.value
      };`,
    },
  });

  return await res.json();
};

//deleteUser

export const deleteUser = async () => {
  const response = await fetch(`${BaseUrl}/deleteUser`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json();
  return data;
};

//use revalidate tag
export default async function RevalidateTag(tag: string) {
  revalidateTag(tag);
}
