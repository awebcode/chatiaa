// userStore.ts

import { create } from "zustand";

interface UserStore {
  IncomingOffer: any | null;
  isRejected?: boolean;
  rejectBy: any;
  localStream: any;
  setLocalStream: (data: any) => void;
  remoteStream: any;
  setRemoteStream: (data: any) => void;
  setIncomingOffer: (data: any) => void;
  clearIncomingOffer: () => void;
}

export const useVidoeCallStore = create<UserStore>((set) => ({
  IncomingOffer: null,
  isRejected: false,
  rejectBy: null,
  localStream: null,
  remoteStream: null,

  setIncomingOffer: (data) => set({ IncomingOffer: data }),
  clearIncomingOffer: () => set({ IncomingOffer: null }),
  setLocalStream: (data: any) => set({ localStream: data }),
  setRemoteStream: (data: any) => set({ remoteStream: data }),
}));
