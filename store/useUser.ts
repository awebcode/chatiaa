// userStore.ts

import { create } from "zustand";

import { Tuser } from "./types";

interface UserStore {
  currentUser: Tuser | null;
  setCurrentUser: (user: Tuser) => void;
  clearcurrentUser: () => void;
}

export const useUserStore = create<UserStore>((set) => {
  // Try to get user info from localStorage
  // const storedUser =
  // const initialUser = storedUser ? JSON.parse(storedUser) : null;
  return {
    currentUser: null,
    setCurrentUser: (user) => {
      // Save user info to localStorage
      // localStorage.setItem("userInfo", JSON.stringify(user));
      set({ currentUser: user });
    },
    clearcurrentUser: () => {
      // Remove user info from localStorage
      // localStorage.removeItem("userInfo");
      localStorage.removeItem("authToken");
      set({ currentUser: null });
    },
  };
});
