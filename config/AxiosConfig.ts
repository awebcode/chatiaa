import axios from "axios";
import Cookie from "js-cookie"
import { BaseUrl } from "./BaseUrl";
export const axiosClient = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
});
axiosClient.interceptors.request.use((config) => {
  const authToken = Cookie.get("next-auth.session-token");
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

