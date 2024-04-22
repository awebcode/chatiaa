import { IMessage } from "@/context/reducers/interfaces";
import { create } from "zustand";



type TEditStore = {
  isEdit: IMessage | null;
  isReply: IMessage | null;
  isSentImageModalOpen: boolean;
  onEdit: (message: IMessage) => void;
  onReply: (message: IMessage) => void;
  cancelReply: () => void;
  cancelEdit: () => void;
};

const useEditReplyStore = create<TEditStore>((set) => ({
  isEdit: null,
  isReply: null,
  isSentImageModalOpen: false, // Corrected initialization
  onEdit: (message: IMessage) => set({ isEdit: message, isReply: null }),
  onReply: (message: IMessage) => set({ isReply: message, isEdit: null }),
  cancelEdit: () => set({ isEdit: null }),
  cancelReply: () => set({ isReply: null }),
}));

export default useEditReplyStore;
