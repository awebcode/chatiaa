import { User } from "../model/UserModel";

interface User {
  _id: string;
}

export async function checkIfAnyUserIsOnline(
  chatUsers: User[],
  reqId: string
): Promise<boolean> {
  const userIds = chatUsers?.map((user: User) => user?._id?.toString()) || [];

  // Query onlineUsersModel for online status of filtered users
  const onlineUsers = await User.find({
    _id: { $in: userIds, $ne: reqId },
    onlineStatus: { $in: ["online", "busy"] },
  });
  // Map the online status to userIds
  const onlineUserIds = onlineUsers.map((user) => user?._id?.toString());

  const isOnline = chatUsers?.some((user: User) => {
    return onlineUserIds.includes(user?._id.toString()) && user?._id.toString() !== reqId;
  });

  return !!isOnline;
}
