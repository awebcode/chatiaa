import { create } from "zustand";
import { Tuser } from "./types";
type TsocketUsers = {
  userId: string;
  socketId: string;
  userInfo:Tuser
};
interface OnlineUsersStore {
  onlineUsers: TsocketUsers[];
  setInitOnlineUsers: (users: TsocketUsers[]) => void;
  addOnlineUser: (user: TsocketUsers) => void;
  removeOnlineUser: (user: TsocketUsers) => void;
}

export const useOnlineUsersStore = create<OnlineUsersStore>((set) => ({
  onlineUsers: [],
  setInitOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (user) =>
    set((state) => {
      // Check if the user with the same id already exists
      const userExists = state.onlineUsers.some(
        (online) => online.userId === user.userId
      );
      if (userExists) {
        // User already exists, return the current state without any modification
        return state;
      } else {
         return {
           onlineUsers: [...state.onlineUsers, user],
         };
      }
      // User doesn't exist, add the new user to the array
     
    }),
  removeOnlineUser: (user) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((online) => online.userId !== user.userId),
    })),
}));
