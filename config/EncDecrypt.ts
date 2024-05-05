import CryptoJS from "crypto-js";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";

// Function to encrypt data and store it in localStorage
// Function to encrypt data and store it in localStorage
export const encryptAndStoreData = (
  data: any,
  key: string,
  localStorageName: string
): void => {
  if (typeof window !== "undefined") {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    localStorage.setItem(localStorageName, encryptedData);
  }
};

// Function to get decrypted chats from localStorage
export const getDecryptedChats = (key: string): IChat[] => {
  if (typeof window !== "undefined") {
    const decryptedChats = localStorage.getItem("chats");
    if (decryptedChats) {
      const byteChats = CryptoJS.AES.decrypt(decryptedChats, key);
      return JSON.parse(byteChats.toString(CryptoJS.enc.Utf8)) as IChat[];
    }
  }
  return [];
};

// Function to get decrypted currentUser from localStorage
export const getDecryptedCurrentUser = (key: string): Tuser | null => {
  if (typeof window !== "undefined") {
    const decryptedCurrentUser = localStorage.getItem("currentUser");
    if (decryptedCurrentUser) {
      const byteCurrentUser = CryptoJS.AES.decrypt(decryptedCurrentUser, key);
      return JSON.parse(byteCurrentUser.toString(CryptoJS.enc.Utf8)) as Tuser;
    }
  }
  return null;
};

// Function to get decrypted selectedChat from localStorage
export const getDecryptedSelectedChat = (key: string): IChat | null => {
  if (typeof window !== "undefined") {
    const decryptedSelectedChat = localStorage.getItem("selectedChat");
    if (decryptedSelectedChat) {
      const byteSelectedChat = CryptoJS.AES.decrypt(decryptedSelectedChat, key);
      return JSON.parse(byteSelectedChat.toString(CryptoJS.enc.Utf8)) as IChat;
    }
  }
  return null;
};

// Function to decrypt any string data from localStorage
export const decryptData = (key: string, localStorageName: string): string | null => {
  if (typeof window !== "undefined") {
    const encryptedData = localStorage.getItem(localStorageName);
    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
      return decryptedData;
    }
  }
  return null;
};