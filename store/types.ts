export type Tuser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  bio: string;
  role: string;
  createdAt: string | number;
  lastActive: string | number;
  isOnline: boolean;
  onlineStatus: "online" | "offline" | "busy";
  socketId: string;
};

//reactions

export type Reaction = {
  _id: string;
  tempReactionId: string;

  emoji: string;
  reactBy: Tuser;

  messageId: string;
  createdAt: string | number;
  updatedAt: string | number;
};
//reactions group
export type ReactionGroup = {
  _id: string;
  count: number;
};
