import { create } from "zustand";
type TsocketUsers = {
  id: string;
  socketId: string;
};
interface OnlineUsersStore {
  onlineUsers: TsocketUsers[];
  setInitOnlineUsers: (users: TsocketUsers[]) => void;
  addOnlineUser: (user: TsocketUsers) => void;
  removeOnlineUser: (user: TsocketUsers) => void;
}

export const useOnlineUsersStore = create<OnlineUsersStore>((set) => ({
  onlineUsers: [],
  setInitOnlineUsers:(users)=>set({onlineUsers:users}),
  addOnlineUser: (user) =>
    set((state) => {
      // Check if the user with the same id already exists
      const userExists = state.onlineUsers.some((online) => online.id === user.id);
      if (userExists) {
        // User already exists, return the current state without any modification
        return state;
      }
      // User doesn't exist, add the new user to the array
      return {
        onlineUsers: [...state.onlineUsers, user],
      };
    }),
  removeOnlineUser: (user) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((online) => online.id !== user.id),
    })),
}));
