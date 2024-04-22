
import { create } from "zustand";



interface MessageStore {
  isIncomingMessage: boolean;
  isFriendsIncomingMessage: boolean;
 
}

const useIncomingMessageStore = create<MessageStore>((set) => ({
  isIncomingMessage: false,
  isFriendsIncomingMessage: false,
 
}));

export default useIncomingMessageStore;
