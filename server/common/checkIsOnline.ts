import { Types } from "mongoose";
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


// Keep track of connected sockets
// Function to add or update a user in the online users model
export const checkOnlineUsers = async (userId: string, socketId: string) => {
  try {
    // Check if the user already exists in the online users model
    await User.findByIdAndUpdate(
      userId,
      { onlineStatus: "online", socketId },
      { new: true }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return null;
    } else {
      console.error("Error checking online users:", error);
    }
  }
};

// Function to get the socket connected user from the User model
export const getSocketConnectedUser = async (id: string | Types.ObjectId) => {
  try {
    // Check if id is a valid ObjectId
    const isObjectId = Types.ObjectId.isValid(id);

    // Construct the query based on whether id is a valid ObjectId or not
    const query = isObjectId
      ? {
          $and: [{ onlineStatus: { $in: ["online", "busy"] } }, { _id: id }],
        }
      : {
          $and: [{ onlineStatus: { $in: ["online", "busy"] } }, { socketId: id }],
        };

    // Query the User model to find the user based on the constructed query
    const user = await User.findOne(query);
    if (user) {
      return {
        userId: user?._id?.toString() as string,
        socketId: user?.socketId as string,
      };
    }
  } catch (error) {
    console.error("Error finding socket connected user:", error);
    return null;
  }
};