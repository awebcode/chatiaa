import { Reaction, ReactionGroup, Tuser } from "@/store/types";

export interface IMessage {
  _id: string;
  chatId: string;
  content: string;
  file: {
    url: string;
    public_id: string;
  };
  createdAt: string;
  isReply: {
    messageId: IMessage;
    repliedBy:Tuser
  }
  reactions: Reaction[];
  reactionsGroup: ReactionGroup[];
  sender: Tuser;
  type: string;
  status: string;
  removedBy: Tuser;
}

export interface IChat {
  chatId?: string;
  latestMessage?: IMessage;
  isGroupChat: boolean;
  groupChatName: string;
  userInfo: Tuser;
  groupAdmin?: Tuser[];
  users: Tuser[];
  chatStatus: {
    status: [string];
    blockedBy: [Tuser];
    mutedBy: [Tuser];
    deleteBy: [Tuser];
    archiveBy: [Tuser];
    leaveBy: [Tuser];
    markAsUnreadBy: [Tuser];
  };
}

export interface State {
  user: Tuser | null;
  selectedChat: IChat | null;
  messages: IMessage[];
  totalMessagesCount: number;
}

export interface Action {
  type: string;
  payload?: any;
}
