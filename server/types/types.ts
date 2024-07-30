export type TUser = {
  _id: string;
  name: string;
  image: string;
  lastActive: string;
};
export type TsocketUsers = {
  userId: string;
  socketId: string;
  userInfo: TUser | null;
};
