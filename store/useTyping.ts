import {create} from "zustand";

interface TypingStore {
  isTyping: boolean;
  senderId: string | null;
  chatId: string | null;
  receiverId: string | null;
  content: string | null;
  startTyping: (senderId: string, receiverId: string,chatId:string, content: string) => void;
  stopTyping: () => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  isTyping: false,
  senderId: null,
  chatId:null,
  receiverId: null,
  content: null,
  startTyping: (senderId, receiverId,chatId, content) =>
    set({ isTyping: true, senderId, receiverId,chatId, content }),
  stopTyping: () =>
    set({ isTyping: false, senderId: null, receiverId: null,chatId:null, content: null }),
}));
