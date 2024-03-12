import { create } from "zustand";

interface OnlineUsersStore {
  onlineUsers: string[];
  addOnlineUser: (users:any) => void;
  removeOnlineUser: (socketId: string) => void;
}

export const useOnlineUsersStore = create<OnlineUsersStore>((set) => ({
  onlineUsers: [],
  addOnlineUser: (users) => set((state) => ({ onlineUsers: users }))
  ,
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((user) => user !== userId),
    })),
}));
