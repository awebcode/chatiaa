import { Request } from "express";
import { Message } from "../model/MessageModel";
import { MessageSeenBy } from "../model/seenByModel";
import { ObjectId } from "mongoose";

interface SeenByInfo {
  seenBy: any[]; // Array of users who have seen the latest message
  isLatestMessageSeen: boolean | null; // Whether the latest message is seen by the requesting user
  totalSeenCount: number; // Total count of users who have seen the latest message
}

export const getSeenByInfo = async (
  chatId: string,
  latestMessageId: ObjectId | null,
  userId: string
): Promise<SeenByInfo|any> => {
  const seenBy = await MessageSeenBy.find({ messageId: latestMessageId })
    .populate({
      path: "userId",
      select: "name image email",
      options: { limit: 5 },
    })
    .sort({ updatedAt: -1 })
    .exec();

  const isLatestMessageSeen = latestMessageId
    ? await MessageSeenBy.exists({
        chatId,
        messageId: latestMessageId,
        userId,
      })
    : null;

  const totalSeenByCount = await MessageSeenBy.countDocuments({
    messageId: latestMessageId,
  });

  return {
    seenBy,
    isLatestMessageSeen,
    totalseenBy: totalSeenByCount,
  };
};
