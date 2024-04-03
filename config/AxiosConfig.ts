import axios from "axios";
import { BaseUrl } from "./BaseUrl";
import { getSession } from "next-auth/react";
export const axiosClient = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
  
});
axiosClient.interceptors.request.use(async(config) => {
  const authToken =await getSession()
  console.log({authToken})
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken?.accessToken}`;
  }
  return config;
});

