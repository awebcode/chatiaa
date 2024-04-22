// notificationStore.ts

import { create } from "zustand";
import { IMessage } from "@/context/reducers/interfaces";

interface NotificationInfo {
  message: IMessage;
}

interface NotificationState {
  notification: NotificationInfo | null;
  addNotification: (message: NotificationInfo["message"]) => void;
  removeNotification: () => void;
}


export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  addNotification: (message) => {
    set({
      notification: {
        message,
      },
    });
  },
  removeNotification: () => {
    set({ notification: null });
  },
}));
