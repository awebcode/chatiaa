import mongoose from "mongoose";
import { onlineUsersModel } from "../model/onlineUsersModel";

interface User {
  _id: string;
}



interface OnlineUser {
  userId: string|mongoose.Types.ObjectId;
}

export async function checkIfAnyUserIsOnline(
  chatUsers: User[],
  reqId: string
): Promise<boolean> {
  const userIds = chatUsers?.map((user: User) => user?._id?.toString()) || [];

  // Query onlineUsersModel for online status of filtered users
  const onlineUsers = await onlineUsersModel.find({ userId: { $in: userIds } });

  // Map the online status to userIds
  const onlineUserIds = onlineUsers.map((user: OnlineUser) => user.userId.toString());

  const isOnline = chatUsers?.some((user: User) => {
    return onlineUserIds.includes(user?._id.toString()) && user?._id.toString() !== reqId;
  });

  return !!isOnline;
}
