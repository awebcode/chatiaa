import { getSeenByInfo } from "./../common/seenByInfo";
import { Request, Response, NextFunction } from "express";
import { Message } from "../model/MessageModel";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { MessageSeenBy } from "../model/seenByModel";
import { Chat } from "../model/ChatModel";

export const pushSeenBy = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const { messageId, chatId, tempMessageId } = req.body;

    // Check if the message exists
    const isMessageExists = await Message.findOne({
      $or: [{ _id: messageId }, { tempMessageId }],
    });
    const isChatExists = await Chat.findOne({ _id: chatId });
    if (!isMessageExists || !isChatExists) {
      return next(new CustomErrorHandler("Message or Chat does not exist", 404));
    }

    // Find all existing records for the user and chat
    let existingSeenBy = await MessageSeenBy.find({
      chatId,
      userId: req.id,
    });

    // If there are existing records, delete them
    if (existingSeenBy.length > 0) {
      await MessageSeenBy.deleteMany({
        chatId,
        userId: req.id,
      });
    }

    // Create a new record for the user and chat with the latest message seen
    const newSeenMessage = await MessageSeenBy.create({
      chatId,
      userId: req.id,
      messageId,
    });
    res.status(200).json({ message: "Message seen!", seenMessage: newSeenMessage });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};
//getSeenByInfoForMessage
export const getSeenByInfoForSingleMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, chatId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;
    const skip = parseInt(req.query.skip) || 0;
    const keyword: any = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    let users = await MessageSeenBy.find({ chatId, messageId })
      .populate({
        path: "userId",
        match: keyword,

        select: "name email image createdAt lastActive onlineStatus",
      })
      .select("-_id userId")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);
    // Filter out null userId entries
    users = users.filter((user) => user.userId !== null);

    // Calculate total count only for non-null userId entries
    let totalFound = await MessageSeenBy.find({ chatId, messageId })
      .populate({
        path: "userId",
        match: keyword,
      })
      .select("-_id userId");
    let total = totalFound.filter((user) => user.userId !== null).length;

    res.status(200).json({ users, total, limit, skip });
  } catch (error) {
    console.log({ error });
    next(error);
  }
};
