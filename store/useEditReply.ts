import { create } from "zustand";

type TMessage = {
  _id: string;
  sender: {
    _id: string;
    username: string;
    pic: string;
    email: string;
  };
  content: string;
};

type TUser = {
  _id: string;
  username: string;
  pic: string;
  email: string;
};

type TEditStore = {
  isEdit: TMessage | null;
  isReply: TMessage | null;
  isSentImageModalOpen:  boolean;
  onEdit: (message: TMessage) => void;
  onReply: (message: TMessage) => void;
  cancelReply: () => void;
  cancelEdit: () => void;
};

const useEditReplyStore = create<TEditStore>((set) => ({
  isEdit: null,
  isReply: null,
  isSentImageModalOpen: false, // Corrected initialization
  onEdit: (message: TMessage) => set({ isEdit: message, isReply: null }),
  onReply: (message: TMessage) => set({ isReply: message, isEdit: null }),
  cancelEdit: () => set({ isEdit: null }),
  cancelReply: () => set({ isReply: null }),
}));

export default useEditReplyStore;
