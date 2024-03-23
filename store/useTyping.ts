import { create } from "zustand";
import { Tuser } from "./types";

interface TypingStore {
  isTyping: boolean;
  senderId: string | null;
  chatId: string | null;
  receiverId: string | null;
  content: string | null;
  userInfo: Tuser|null;
  startTyping: (
    senderId: string,
    receiverId: string,
    chatId: string,
    content: string,
    userInfo: Tuser
  ) => void;
  stopTyping: () => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  isTyping: false,
  senderId: null,
  chatId: null,
  receiverId: null,
  content: null,
  userInfo: null,
  startTyping: (senderId, receiverId, chatId, content, userInfo) =>
    set({ isTyping: true, senderId, receiverId, chatId, content, userInfo }),
  stopTyping: () =>
    set({
      isTyping: false,
      senderId: null,
      receiverId: null,
      chatId: null,
      content: null,
    }),
}));
