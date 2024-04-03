import axios from "axios";
import Cookie from "js-cookie"
import { BaseUrl } from "./BaseUrl";
import { getSession } from "next-auth/react";
export const axiosClient = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
  
});
axiosClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  console.log({t:session})
  if ((session as any)?.accessToken) {
    config.headers.Authorization = `Bearer ${(session as any)?.accessToken}`;
  }
  return config;
});

