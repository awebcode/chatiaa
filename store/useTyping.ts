import { create } from "zustand";
import { Tuser } from "./types";

interface TypingState {
  senderId: string;
  chatId: string;
  content: string;
  userInfo: Tuser;
}

interface TypingStore {
  typingUsers: TypingState[];
  startTyping: (typingState: TypingState) => void;
  stopTyping: (senderId: string, chatId: string) => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  typingUsers: [],
  startTyping: (typingState) =>
    set((state) => {
      // Check if the user is already typing
      const userExists = state.typingUsers.some(
        (typingUser) =>
          typingUser.senderId === typingState.senderId &&
          typingUser.chatId === typingState.chatId
      );

      if (userExists) {
        // User already exists, return the current state without any modification
        return state;
      }

      // User doesn't exist, add the new typing state to the array
      return {
        typingUsers: [typingState, ...state.typingUsers],
      };
    }),
  stopTyping: (senderId, chatId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (typingState) => typingState.senderId !== senderId
      ),
    })),
}));
