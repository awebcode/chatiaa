import {create} from "zustand";

import { Tuser } from "./types";

interface Message {
  content: string;
  createdAt: Date;
  reactions: any[]; // Adjust the type based on your actual data structure
  sender: Tuser;
  status: string;
  updatedAt: Date;
  // __v: number;
  // _id: string;
}

interface Chat {
  chatName: string;
  createdAt: Date;
  isGroupChat: boolean;
  latestMessage: string;
  updatedAt: Date;
  users: string[];

  _id: string;
}

interface AppState {
 
  message: Message | Chat | null;
  chat:Chat|null
  
}

interface AppStore extends AppState {
 
  setInitialMessage: (messageData: Message) => void;
  setInitialChat: (chatData: Chat) => void;
  clearData: () => void;
}

export const useMessageStore = create<AppStore>((set) => ({
  
  message: null,
  chat:null,
  
  setInitialMessage: (messageData) => set({ message: messageData }),
  setInitialChat: (chatData) => set({ chat: chatData }),
  clearData: () => set({ message: null }),
}));

