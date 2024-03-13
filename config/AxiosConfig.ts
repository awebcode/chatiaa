import axios from "axios";
import Cookie from "js-cookie"
import { BaseUrl } from "./BaseUrl";
export const axiosClient = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
});
axiosClient.interceptors.request.use((config) => {
  const authToken = Cookie.get(
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token"
  );
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

