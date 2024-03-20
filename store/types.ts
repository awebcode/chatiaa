export type Tuser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  lastActive: string;
};

//reactions

export type Reaction = {
  _id: string;
  emoji: string;
  reactBy: Tuser;

  messageId: string;
  createdAt: string;
  updatedAt: string;
};
//reactions group
export type ReactionGroup = {
 _id: string;
 count:number
};
