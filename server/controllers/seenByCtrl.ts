import { Request, Response, NextFunction } from "express";
import { Message } from "../model/MessageModel";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { MessageSeenBy } from "../model/seenByModel";
import { Chat } from "../model/ChatModel";

export const pushSeenBy = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, chatId } = req.body;

    // Check if the message exists
    const isMessageExists = await Message.findOne({ _id: messageId });
    const isChatExists = await Chat.findOne({ _id: chatId });
    if (!isMessageExists || !isChatExists) {
      return next(new CustomErrorHandler("Message or Chat does not exist", 404));
    }

    // Check if there is an existing record for the user and chat
    let existingSeenBy = await MessageSeenBy.findOne({ chatId, userId: req.id });

    // If there's an existing record, delete it
    if (existingSeenBy) {
      await MessageSeenBy.findByIdAndDelete(existingSeenBy._id);
    }

    // Create a new record for the user and chat with the latest message seen
    const newSeenMessage = new MessageSeenBy({
      chatId,
      userId: req.id,
      messageId,
    });
    await newSeenMessage.save();
    res
      .status(200)
      .json({ message: "Message seen successfully", seenMessage: newSeenMessage });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};
