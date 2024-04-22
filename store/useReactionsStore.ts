import { create } from "zustand";
import { Reaction, ReactionGroup } from "./types";

interface ReactionStoreState {
  reactions: Reaction[];
  reactionsGroup: ReactionGroup[];
  totalReactions: number;
  setReactions: (reactions: Reaction[]) => void;
  setReactionsGroup: (reactionsGroup: ReactionGroup[]) => void;
  setTotalReactions: (totalReactions: number) => void;
  removeAllReactions: () => void;
  addNewReaction: (reaction: Reaction & { type: string }) => void;
  updateReaction: (reaction: Reaction & { type: string }) => void;
  removeReaction: (reaction: Reaction & { type: string }) => void;
}

const useReactionStore = create<ReactionStoreState>((set) => ({
  reactions: [],
  reactionsGroup: [],
  totalReactions: 0,
  setReactions: (reactions) => set({ reactions }),
  setReactionsGroup: (reactionsGroup) => set({ reactionsGroup }),
  setTotalReactions: (totalReactions) =>
    set((state) => ({
      // Spread the existing state to keep other values intact
      ...state,
      // Update the totalReactions value
      totalReactions: totalReactions,
    })),
  removeAllReactions: () => set({ reactions: [], reactionsGroup: [], totalReactions: 0 }),
  addNewReaction: (reaction: Reaction & { type: string }) =>
    set((state) => {
      // For add type, add the new reaction and update the reactionsGroup
      const updatedReactions = [reaction, ...state.reactions];
      let updatedReactionsGroup = [...state.reactionsGroup]; // Create a copy of the original reactionsGroup

      // Find the index of the emoji in reactionsGroup
      const emojiIndex = updatedReactionsGroup.findIndex(
        (emoji) => emoji._id === reaction.emoji
      );

      if (emojiIndex !== -1) {
        // If the emoji already exists, increment its count
        updatedReactionsGroup[emojiIndex] = {
          ...updatedReactionsGroup[emojiIndex],
          count: updatedReactionsGroup[emojiIndex].count + 1,
        };
      } else {
        // If the emoji doesn't exist, add a new entry
        updatedReactionsGroup.push({
          _id: reaction.emoji,
          count: 1,
        });
      }

      return {
        ...state,
        totalReactions: state.totalReactions + 1,
        reactions: updatedReactions,
        reactionsGroup: updatedReactionsGroup,
      };
    }),
  updateReaction: (newReact) =>
    set((state) => {
      // For update type, replace the existing reaction with the updated one
      const updatedReactions = state.reactions.map((reaction) =>
        reaction._id === newReact._id
          ? newReact // Replace the existing reaction with the updated one
          : reaction
      );

      let updatedReactionsGroup = [...state.reactionsGroup]; // Create a copy of the original reactionsGroup

      if (updatedReactionsGroup.length === 1) {
        // If there's only one emoji in reactionsGroup, replace it with the new emoji
        updatedReactionsGroup = [
          {
            _id: newReact.emoji,
            count: 1,
          },
        ];
      } else {
        // Update reactionsGroup if the emoji of the updated reaction has changed
        updatedReactionsGroup = updatedReactionsGroup.map((emoji) =>
          emoji._id === newReact.emoji
            ? { ...emoji, count: emoji.count - 1 } // Decrement count for old emoji
            : emoji
        );

        // Find the index of the updated reaction's emoji in reactionsGroup
        const updatedEmojiIndex = updatedReactionsGroup.findIndex(
          (emoji) => emoji._id === newReact.emoji
        );

        if (updatedEmojiIndex !== -1) {
          // If the emoji exists in reactionsGroup, increment its count
          updatedReactionsGroup[updatedEmojiIndex].count++;
        } else {
          // If the emoji doesn't exist, add a new entry
          updatedReactionsGroup.push({
            _id: newReact.emoji,
            count: 1,
          });
        }
      }
      return { ...state, reactions: updatedReactions };
    }),
  removeReaction: (removedReact) =>
    set((state) => {
      // For remove type, filter out the removed reaction and update the reactionsGroup
      const updatedReactions = state.reactions.filter(
        (reaction) => reaction._id !== removedReact._id
      );
      // Filter out emojis with count === 1 before mapping
      const updatedReactionsGroup = state.reactionsGroup
        .filter((emoji) => emoji.count !== 1) // Filter out emojis with count === 1
        .map((emoji) => {
          if (emoji._id === removedReact.emoji) {
            // If the emoji matches, decrement the count
            return { ...emoji, count: Math.max(0, emoji.count - 1) };
          }
          return emoji;
        });

      return {
        totalReactions: state.totalReactions - 1,
        reactions: updatedReactions,
        reactionsGroup: updatedReactionsGroup,
      };
    }),
}));

export default useReactionStore;
