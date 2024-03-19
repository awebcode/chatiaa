import { Tuser } from "@/store/types";

export interface IMessage {
  _id: string;
  chatId: string;
  content: string;
  createdAt: string;
  reactions: Tuser & { emoji: string };
  sender: Tuser;
  type: string;
  file: {
    url: string;
    public_id:string
  }
}

export interface IChat {
  chatId?: string;
  lastMessage?: string;
  isGroupChat: boolean;
  groupChatName: string;
  userInfo: Tuser;
  groupAdmin?: Tuser[];
  users: Tuser[];
  status?: string;
  chatUpdatedBy: Tuser;
}

export interface State {
  user: Tuser | null;
  selectedChat: IChat | null;
  messages: IMessage[];
  totalMessagesCount:number
}

export interface Action {
  type: string;
  payload?: any;
}
