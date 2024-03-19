// userStore.ts

import { create } from "zustand";
import { Tuser } from "./types";

interface ChatData {
  chatId?: string;
  lastMessage?: string;
  createdAt?: Date;
  name?: string;
  email?: string;
  userId?: string;
  image?: string;
  isGroupChat: boolean;
  groupChatName: string;
  userInfo: Tuser;
  groupAdmin?: Tuser[];
  users: Tuser[];
  status?: string;
  chatUpdatedBy: Tuser;
}

interface UserStore {
  myChats: ChatData[] | null;
  selectedChat: ChatData | null;
  setSelectedChat: (user: ChatData) => void;
  clearselectedChat: () => void;
}

export const useChatStore = create<UserStore>((set) => ({
  selectedChat: null,
  myChats: null,
  setSelectedChat: (user) => set({ selectedChat: user }),
  clearselectedChat: () => set({ selectedChat: null }),
}));
