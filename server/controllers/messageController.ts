//@description     Get all Messages
//@route           GET /api/Message/:chatId

import { NextFunction, Request, Response } from "express";
import { Message } from "../model/MessageModel";
import { User } from "../model/UserModel";
import { Chat } from "../model/ChatModel";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { Reaction } from "../model/reactModal";
import { v2 } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import { getSocketConnectedUser, io } from "../index";
import { getFileType } from "./functions";
import { MessageSeenBy } from "../model/seenByModel";
//@access          Protected
export const allMessages = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    let messages: any = await Message.find({ chat: req.params.chatId })
      .populate([
        {
          path: "isReply.messageId",
          select: "content file type",
          populate: { path: "sender", select: "name image email" },
        },
        {
          path: "isReply.repliedBy",
          select: "name image email",
        },
        {
          path: "isEdit.messageId",
          select: "content file type",
          populate: { path: "sender", select: "name image email" },
        },
        {
          path: "isEdit.editedBy",
          select: "name image email",
        },
      ])

      .populate("sender removedBy unsentBy", "name image email")
      .populate("chat")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    // .sort({ _id: -1 }) // Use _id for sorting in descending order

    messages = await User.populate(messages, {
      path: "sender chat.users",
      select: "name image email lastActive",
    });
    // Populate reactions for each message
    messages = await Promise.all(
      messages.map(async (message: any) => {
        const { reactionsGroup, totalReactions } = await countReactionsGroupForMessage(
          message._id
        );
        const reactions = await Reaction.find({ messageId: message._id })
          .populate({
            path: "reactBy",
            select: "name image email",
            options:{limit:10}
          })
          .sort({ updatedAt: -1 })
          .exec();
         //seenBy
         const seenBy = await MessageSeenBy.find({ messageId: message._id })
           .populate({
             path: "userId",
             select: "name image email",
             options: { limit: 10 },
           })
           .sort({ updatedAt: -1 })
           .exec();
        //total seen by
         const totalseenBy = await MessageSeenBy.countDocuments({ messageId: message._id })
          
        return {
          ...message.toObject(),
          reactions,
          reactionsGroup,
          totalReactions,
          seenBy:seenBy,
          totalseenBy,
        };
      })
    );
    //find reactions here and pass with every message
    //@
    const total = await Message.countDocuments({ chat: req.params.chatId });

    res.json({ messages, total, limit, page, skip });
  } catch (error: any) {
    console.log({ error });
    next(error);
  }
};
// Count the number of reactions for a specific message
const countReactionsGroupForMessage = async (messageId: any) => {
  try {
    const reactionsGroup = await Reaction.aggregate([
      { $match: { messageId: new mongoose.Types.ObjectId(messageId) } }, // Match reactions for the given message ID
      { $group: { _id: "$emoji", count: { $sum: 1 } } }, // Group reactions by emoji and count
      { $sort: { count: -1 } }, // Sort by count in descending order
      // { $limit: 4 }, // Limit to top 4 groups
    ]);
    const totalReactions = await Reaction.countDocuments({ messageId });
    return { reactionsGroup, totalReactions };
  } catch (error) {
    console.error("Error counting reactions:", error);
    throw error; // Forward error to the caller
  }
};
//get reaction base on message id while scroll and filter
export const getMessageReactions = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    console.log(req.query);
    const reactions = await Reaction.find(
      req.query.emoji === "all" || req.query.emoji === ""
        ? {
            messageId,
          }
        : { messageId, emoji: req.query.emoji }
    )
      .populate({
        path: "reactBy",
        select: "name image email",
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
    res.json(reactions);
  } catch (error) {
    console.error("Error getting message reactions:", error);
    next(error);
  }
};
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
export const sendMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { content, chatId, type, receiverId } = req.body;

  if (!chatId) {
    return next(new CustomErrorHandler("Chat Id cannot be empty!", 400));
  }

  try {
    if (type === "file") {
      const fileUploadPromises = req.files.map(async (file: Express.Multer.File) => {
        const fileType = await getFileType(file);

        const url = await v2.uploader.upload(file.path, {
          resource_type: "raw",
          folder: "messengaria_2024",
          format: file.mimetype === "image/svg+xml" ? "png" : "",
        });

        const localFilePath = file.path;
        fs.unlink(localFilePath, (err) => {
          if (err) {
            console.error(`Error deleting local file: ${err.message}`);
          } else {
            //  console.log(`Local file deleted: ${localFilePath}`);
          }
        });
        const newFileMessage = {
          sender: req.id,
          file: { public_Id: url.public_id, url: url.url },
          chat: chatId,
          type:
            file.mimetype === "audio/mp3"
              ? "audio"
              : file.mimetype === "image/svg+xml"
              ? "image"
              : fileType,
        };

        // Create and populate message
        let message: any = await Message.create(newFileMessage);
        message = await message.populate("sender chat", "name email image");
        message = await User.populate(message, {
          path: "sender chat.users",
          select: "name image email",
        });

        // Update latest message for the chat
        const chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        // Send message to client
        if (chat?.isGroupChat) {
          chat?.users.forEach((user) => {
            const receiverId = getSocketConnectedUser(user);
            if (receiverId) {
              io.to(chat?._id.toString())
                .to(receiverId.socketId)
                .emit("receiveMessage", {
                  ...message.toObject(),
                  receiverId: receiverId.id,
                });
            }
          });
        } else {
          io.to(chat?._id.toString() as any)
            .to(receiverId)
            .emit("receiveMessage", { ...message, receiverId });
        }
        return message;
      });

      // Wait for all file uploads to complete
      await Promise.all(fileUploadPromises);
      res.status(200).json({ message: "File send sucessfully" });
    } else {
      const newMessage = {
        sender: req.id,
        content: content,
        chat: chatId,
      };

      // Create and populate message
      let message: any = await Message.create(newMessage);
      message = await message.populate("sender chat", "name image email");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name image email",
      });

      // Update latest message for the chat
      const chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
      if (chat?.isGroupChat) {
        chat?.users.forEach((user) => {
          const receiverId = getSocketConnectedUser(user);
          if (receiverId) {
            io.to(chat?._id.toString())
              .to(receiverId.socketId)
              .emit("receiveMessage", {
                ...message.toObject(),
                receiverId: receiverId.id,
              });
          }
        });
      } else {
        io.to(chat?._id.toString() as any)
          .to(receiverId)
          .emit("receiveMessage", { ...message, receiverId });
      }

      res.status(200).json({ message: "File send sucessfully" });
      // Send message to client
    }

    // res.json(message);
  } catch (error: any) {
    next(error);
  }
};

//update message status
export const updateChatMessageController = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, status } = req.body;
    if (!status || !chatId)
      return next(new CustomErrorHandler("Chat Id or status cannot be empty!", 400));

    const chat = await Chat.findById(chatId)?.populate("latestMessage");

    if (!chat || !chat.latestMessage) {
      return next(new CustomErrorHandler("Chat or latest message not found", 404));
    }

    const updateMessage = await Message.findByIdAndUpdate(
      chat.latestMessage._id,
      { status },
      { new: true }
    );

    const updateChat = await Chat.findByIdAndUpdate(chatId, {
      latestMessage: updateMessage?._id,
    })
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name image" },
      })
      .populate("users", "name image");

    res.status(200).json({ success: true, chat: updateChat });
  } catch (error) {
    next(error);
  }
};

//update all messages status as seen
export const updateAllMessageStatusSeen = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId)
      return next(new CustomErrorHandler("Chat Id  cannot be empty!", 400));
    const lastMessage: any = await Chat.findById(req.params.chatId).populate(
      "latestMessage"
    );

    if (lastMessage?.latestMessage?.sender?.toString() === req.id) {
      return;
    }

    await Chat.findByIdAndUpdate(req.params.chatId, {
      latestMessage: lastMessage?.latestMessage?._id,
    });
    const updatedMessage = await Message.find(
      { chat: req.params.chatId },
      {
        status: { $in: ["unseen", "delivered"] },
        // sender: { $ne: req.id }
      }
    ).updateMany({
      status: "seen",
    });
    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

//update all message status as delivered after reconnect/rejoin/login a user

export const updateChatMessageAsDeliveredController = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === "undefined") {
      // return next(new CustomErrorHandler("User Id cannot be empty!", 400));
      return res.json({});
    }

    // Find all chats where the user is a participant
    const chats = await Chat.find({ users: { $in: [userId] } }).populate("latestMessage");

    if (!chats || chats.length === 0) {
      // console.log("hi")
      //  return next(new CustomErrorHandler("No chats found for the user", 404));
      return res.json({});
    }

    // Update all messages in each chat
    const updatePromises = chats.map(async (chat: any) => {
      if (!chat.latestMessage) {
        return; // Skip chats without a latest message
      }
      // Update the latest message's status to "delivered"
      if (
        chat.latestMessage?.status === "unseen" &&
        chat.latestMessage?.sender.toString() !== req.id
      ) {
        await Message.findByIdAndUpdate(
          chat.latestMessage._id,
          { status: "delivered" },
          { new: true }
        );
        // console.log({ sender: req.id === chat.latestMessage?.sender.toString() });

        // Update the chat with the new latest message
        await Chat.findByIdAndUpdate(chat._id, {
          latestMessage: chat.latestMessage._id,
        });

        await Message.find(
          { chat: chat._id },
          {
            status: { $in: ["unseen", "unsent"] },
            // sender: { $ne: req.id }
          }
        ).updateMany({
          status: "delivered",
        });
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Respond with success
    res.status(200).json({ success: true, message: "Messages updated as delivered" });
  } catch (error) {
    next(error);
  }
};

///

//update message status as remove

export const updateMessageStatusAsRemove = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, status, chatId } = req.body;
    const prevMessage = await Message.findById({ _id: messageId });

    if (!status || !messageId || !chatId)
      return next(new CustomErrorHandler("Message Id or status cannot be empty!", 400));

    const chat = await Chat.findById(chatId)?.populate("latestMessage");
    if (chat?.latestMessage?._id.toString() === messageId) {
      return next(new CustomErrorHandler("You cannot remove the latestMessage", 400));
    }

    let updateMessage: any;

    if (status === "removed" || status === "reBack") {
      updateMessage = await Message.updateOne(
        { _id: messageId },
        { $set: { status, removedBy: status === "reBack" ? null : req.id } }
      );
    } else if (status === "removeFromAll") {
      await Message.findByIdAndDelete(messageId);
      return res.status(200).json({ success: true });
    }

    // Set the updatedAt field back to its previous value
    updateMessage.updatedAt = prevMessage?.updatedAt;

    res.status(200).json({ success: true, updateMessage });
  } catch (error) {
    next(error);
  }
};

//update message status as unsent

export const updateMessageStatusAsUnsent = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, status, chatId } = req.body;

    if (!status || !messageId)
      return next(new CustomErrorHandler("Message Id or status  cannot be empty!", 400));
    const chat = await Chat.findById(chatId)?.populate("latestMessage");
    if (chat?.latestMessage?._id.toString() === messageId) {
      return next(new CustomErrorHandler("You cannot remove the latestMessage", 400));
    }
    const updateMessage = await Message.updateOne(
      { _id: messageId },
      { $set: { status: "unsent", unsentBy: req.id, content: "unsent" } }
    );
    res.status(200).json({ success: true, updateMessage });
  } catch (error) {
    next(error);
  }
};


//reply Message

export const replyMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, messageId, content, type, receiverId } = req.body;
    if (!chatId || !messageId) {
      return next(new CustomErrorHandler("messageId  or chatId cannot be empty!", 400));
    }

    let message: any;
    if (type === "file") {
      const fileUploadPromises = req.files.map(async (file: Express.Multer.File) => {
        const fileType = await getFileType(file);

        const url = await v2.uploader.upload(file.path, {
          resource_type: "raw",
          folder: "messengaria_2024",
          format: file.mimetype === "image/svg+xml" ? "png" : "",
        });

        const localFilePath = file.path;
        fs.unlink(localFilePath, (err) => {
          if (err) {
            console.error(`Error deleting local file: ${err.message}`);
          } else {
            //  console.log(`Local file deleted: ${localFilePath}`);
          }
        });

        // Create and populate message
        message = await Message.create({
          sender: req.id,
          isReply: { repliedBy: req.id, messageId },
          image: { public_Id: url.public_id, url: url.url },

          file: { public_Id: url.public_id, url: url.url },
          chat: chatId,
          type:
            file.mimetype === "audio/mp3"
              ? "audio"
              : file.mimetype === "image/svg+xml"
              ? "image"
              : fileType,
        });

        message = await message
          .populate([
            {
              path: "isReply.messageId",
              select: "content file type",
              populate: { path: "sender", select: "name image email" },
            },
            {
              path: "isReply.repliedBy",
              select: "name image email",
            },
          ])
          .populate("chat");

        message = await User.populate(message, {
          path: "chat.users",
          select: "name image email",
        });
        // Update latest message for the chat
        const chat = await Chat.findByIdAndUpdate(chatId, {
          latestMessage: message,
        });

        // Send message to client
        if (chat?.isGroupChat) {
          chat?.users.forEach((user) => {
            const receiverId = getSocketConnectedUser(user);
            if (receiverId) {
              io.to(chat?._id.toString())
                .to(receiverId.socketId)
                .emit("replyMessage", {
                  ...message.toObject(),
                  receiverId: receiverId.id,
                });
            }
          });
        } else {
          io.to(chat?._id.toString() as any)
            .to(receiverId)
            .emit("replyMessage", { ...message, receiverId });
        }
        return message;
      });

      // Wait for all file uploads to complete
      await Promise.all(fileUploadPromises);
      res.status(200).json({ message: "Reply Message sucessfully" });
    } else {
      message = await Message.create({
        sender: req.id,
        isReply: { repliedBy: req.id, messageId },
        content,
        type: "text",
        chat: chatId,
      });
    }

    message = await Message.findOne(message._id)
      .populate("sender chat", "name image email")
      .populate([
        {
          path: "isReply.messageId",
          select: "content file type",
          populate: { path: "sender", select: "name image email" },
        },
        {
          path: "isReply.repliedBy",
          select: "name image email",
        },
      ])
      .populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name image email",
    });

    const chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    if (chat?.isGroupChat) {
      chat?.users.forEach((user) => {
        const receiverId = getSocketConnectedUser(user);
        if (receiverId) {
          io.to(chat?._id.toString())
            .to(receiverId.socketId)
            .emit("replyMessage", {
              ...message.toObject(),
              receiverId: receiverId.id,
            });
        }
      });
    } else {
      io.to(chat?._id.toString() as any)
        .to(receiverId)
        .emit("replyMessage", { ...message, receiverId });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

//edit message

export const editMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, chatId, content, type, receiverId } = req.body;
    if (!messageId)
      return next(new CustomErrorHandler("messageId  cannot be empty!", 400));
    const isLastMessage = await Chat.findOne({ _id: chatId, latestMessage: messageId });

    const prevMessage: any = await Message.findById(messageId);
    //delete Previous Image
    if (prevMessage.file?.public_Id) {
      await v2.uploader.destroy(prevMessage.file?.public_Id);
    }
    let editedChat: any;

    if (type === "file") {
      const fileUploadPromises = req.files.map(async (file: Express.Multer.File) => {
        const fileType = await getFileType(file);

        const url = await v2.uploader.upload(file.path, {
          resource_type: "raw",
          folder: "messengaria_2024",
          format: file.mimetype === "image/svg+xml" ? "png" : "",
        });

        const localFilePath = file.path;
        fs.unlink(localFilePath, (err) => {
          if (err) {
            console.error(`Error deleting local file: ${err.message}`);
          } else {
            //  console.log(`Local file deleted: ${localFilePath}`);
          }
        });

        editedChat = await Message.findByIdAndUpdate(
          messageId,
          {
            content: "",
            isEdit: { editedBy: req.id },
            file: { public_Id: url.public_id, url: url.url },
            type:
              file.mimetype === "audio/mp3"
                ? "audio"
                : file.mimetype === "image/svg+xml"
                ? "image"
                : fileType,
          },
          { new: true }
        )
          .populate("sender isEdit.editedBy", "name email image")
          .populate("chat");

        editedChat = await User.populate(editedChat, {
          path: "chat.users",
          select: "name image email",
        });
        if (isLastMessage) {
          await Chat.findByIdAndUpdate(chatId, { latestMessage: editedChat });
        }
        const chat = await Chat.findByIdAndUpdate(chatId);
        // Send message to client
        if (chat?.isGroupChat) {
          chat?.users.forEach((user) => {
            const receiverId = getSocketConnectedUser(user);
            if (receiverId) {
              io.to(chat?._id.toString())
                .to(receiverId.socketId)
                .emit("editMessage", {
                  ...editedChat.toObject(),
                  receiverId: receiverId.id,
                });
            }
          });
        } else {
          io.to(chat?._id.toString() as any)
            .to(receiverId)
            .emit("editMessage", { ...editedChat, receiverId });
        }
        return editedChat;
      });

      // Wait for all file uploads to complete
      await Promise.all(fileUploadPromises);
      res.status(200).json({ message: "Edit Message sucessfully" });
    } else {
      if (!messageId || !content)
        return next(
          new CustomErrorHandler("messageId or content  cannot be empty!", 400)
        );
      const message = await Message.findOne(messageId);
      if (message?.file?.public_Id) {
        await v2.uploader.destroy(message.file.public_Id);
      }
      editedChat = await Message.findByIdAndUpdate(
        messageId,
        {
          isEdit: { editedBy: req.id },
          content,
          type: "text",
          file: null,
        },
        { new: true }
      )
        .populate("sender isEdit.editedBy", "name email image")
        .populate("chat");

      editedChat = await User.populate(editedChat, {
        path: "chat.users",
        select: "name image email",
      });
    }
    if (isLastMessage) {
      await Chat.findByIdAndUpdate(chatId, { latestMessage: editedChat });
    }
    const chat = await Chat.findByIdAndUpdate(chatId);
    // Send message to client
    if (chat?.isGroupChat) {
      chat?.users.forEach((user) => {
        const receiverId = getSocketConnectedUser(user);
        if (receiverId) {
          io.to(chat?._id.toString())
            .to(receiverId.socketId)
            .emit("editMessage", {
              ...editedChat.toObject(),
              receiverId: receiverId.id,
            });
        }
      });
    } else {
      io.to(chat?._id.toString() as any)
        .to(receiverId)
        .emit("editMessage", { ...editedChat, receiverId });
    }
    res.status(200).json({ success: true, editedChat });
  } catch (error) {
    next(error);
  }
};

//addRemoveEmojiReaction

export const addRemoveEmojiReactions = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, emoji, type, reactionId, receiverId, chatId } = req.body;
    const chat = await Chat.findByIdAndUpdate(chatId);

    switch (type) {
      case "add": {
        if (!messageId || !emoji) {
          return next(new CustomErrorHandler("messageId or emoji cannot be empty!", 400));
        }
        const existingReaction = await Reaction.findOne({
          messageId,
          reactBy: req.id,
        });

        if (existingReaction) {
          // Emoji update logic
          const reaction = await Reaction.findOneAndUpdate(
            { messageId, reactBy: req.id },
            { $set: { emoji } },
            { new: true, upsert: true }
          ).populate("reactBy", "name email image");
          // Send message to client
          if (chat?.isGroupChat) {
            chat?.users.forEach((user) => {
              const receiverId = getSocketConnectedUser(user);
              if (receiverId) {
                io.to(chat?._id.toString())
                  .to(receiverId.socketId)
                  .emit("addReactionOnMessage", {
                    reaction,
                    type: "update",
                  });
              }
            });
          } else {
            io.to(chat?._id.toString() as any)
              .to(receiverId)
              .emit("addReactionOnMessage", { reaction, type: "update" });
          }
          res.status(200).json({ success: true, reaction });
        } else {
          // Create a new reaction
          let react = await Reaction.create({
            messageId,
            emoji,
            reactBy: req.id,
          });

          const reaction = await react.populate("reactBy", "name email image");

          // Send message to client
          if (chat?.isGroupChat) {
            chat?.users.forEach((user) => {
              const receiverId = getSocketConnectedUser(user);
              if (receiverId) {
                io.to(chat?._id.toString())
                  .to(receiverId.socketId)
                  .emit("addReactionOnMessage", {
                    reaction,
                    type: "add",
                  });
              }
            });
          } else {
            io.to(chat?._id.toString() as any)
              .to(receiverId)
              .emit("addReactionOnMessage", { reaction, type: "add" });
          }

          res.status(200).json({ success: true, reaction });
        }

        break;
      }
      case "remove": {
        if (!reactionId)
          return next(new CustomErrorHandler("reactionId cannot be empty!", 400));
        const reaction = await Reaction.findByIdAndDelete(reactionId);
        if (chat?.isGroupChat) {
          chat?.users.forEach((user) => {
            const receiverId = getSocketConnectedUser(user);
            if (receiverId) {
              io.to(chat?._id.toString())
                .to(receiverId.socketId)
                .emit("addReactionOnMessage", {
                  reaction,
                  type: "remove",
                });
            }
          });
        } else {
          io.to(chat?._id.toString() as any)
            .to(receiverId)
            .emit("addReactionOnMessage", {
              reaction,
              type: "remove",
            });
        }
        res.status(200).json({ success: true, reaction });
        break;
      }
      default:
        res.status(400).json({ success: false, message: "Invalid operation type" });
    }
  } catch (error) {
    next(error);
  }
};



