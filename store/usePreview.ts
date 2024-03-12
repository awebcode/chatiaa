import {create} from "zustand";

interface PreviewStore {
  isPreviewOpen: boolean;
  imageUrl: string;

  openPreview: (imageUrl: string) => void;
  closePreview: () => void;
}

export const useImagePreviewStore = create<PreviewStore>((set) => ({
  isPreviewOpen: false,
  imageUrl: "",

  openPreview: (imageUrl) => {
    set({ isPreviewOpen: true, imageUrl });
  },

  closePreview: () => {
    set({ isPreviewOpen: false, imageUrl: "" });
  },
}));

