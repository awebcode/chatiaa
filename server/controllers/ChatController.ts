//@description     Create or fetch One to One Chat
//@route           POST /api/chat/

import { NextFunction, Request, Response } from "express";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { Chat } from "../model/ChatModel";
import { User } from "../model/UserModel";
import { Message } from "../model/MessageModel";
import mongoose from "mongoose";

//@access          Protected
export const accessChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new CustomErrorHandler("Chat Id or content cannot be empty!", 400));
  }

  var isChat: any = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name image email lastActive",
  });

  if (isChat.length > 0) {
    res.status(200).send({ chatData: isChat[0] });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      let FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "name email image lastActive"
      );

      res.status(201).json({ success: true, isNewChat: true, chatData: FullChat });
    } catch (error: any) {
      next(error);
    }
  }
};

export const fetchChats = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const keyword: any = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const unseenCount: any = await unseenMessagesCounts(limit, skip, keyword, req.id);
    // console.log({unseenCount})
    // Count the total documents matching the keyword
    const totalDocs = await Chat.countDocuments({
      users: { $elemMatch: { $eq: req.id } },
    });

    const chats = await Chat.find({
      $or: [
        { users: { $elemMatch: { $eq: req.id } } },
        { chatName: { $regex: req.query.search, $options: "i" } },
      ],
    })
      .populate({
        path: "users",
        select: "-password",
        options: { limit: 5 }, // Set limit to Infinity to populate all documents
      })
      .populate("groupAdmin", "email name image")
      .populate("latestMessage")
      .populate("chatBlockedBy", "name image email")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip);
    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name image email lastActive ",
    });
    // Filter the populatedChats array based on the keyword
    let filteredChats: any = [];
    if (req.query.search && keyword) {
      filteredChats = populatedChats.filter(
        (chat: any) =>
          chat.users.some(
            (user: any) =>
              user.name.match(new RegExp(keyword.$or[0].name.$regex, "i")) ||
              user.email.match(new RegExp(keyword.$or[1].email.$regex, "i"))
          ) || chat.chatName.match(new RegExp(keyword.$or[0].name.$regex, "i")) // Add chatName filtering condition
      );
    }

    const filteredChatsWithUnseenCount = filteredChats.map((chat: any) => {
      const correspondingUnseenCount = unseenCount.find(
        (count: any) => count._id.toString() === chat._id.toString()
      );
      return {
        ...chat.toObject(),
        unseenCount: correspondingUnseenCount
          ? correspondingUnseenCount.unseenMessagesCount
          : 0,
      };
    });

    // Modify populatedChats to include unseenCount for each chat
    const populatedChatsWithUnseenCount = populatedChats.map((chat: any) => {
      const correspondingUnseenCount = unseenCount.find(
        (count: any) => count._id.toString() === chat._id.toString()
      );
      return {
        ...chat.toObject(),
        unseenCount: correspondingUnseenCount
          ? correspondingUnseenCount.unseenMessagesCount
          : 0,
      };
    });
    res.status(200).send({
      chats:
        filteredChats.length > 0
          ? filteredChatsWithUnseenCount
          : req.query.search
          ? []
          : populatedChatsWithUnseenCount,
      total:
        filteredChats.length > 0
          ? filteredChats.length
          : req.query.search
          ? 0
          : totalDocs,
      limit,
      unseenCountArray: unseenCount,
    });
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};
//unseenMessagesCounts for every single chat
const unseenMessagesCounts = async (limit: any, skip: any, keyword: any, userId: any) => {
  try {
    const unseenCount = await Chat.aggregate([
      {
        $match: {
          users: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "chat",
          as: "messages",
        },
      },
      {
        $unwind: "$messages",
      },

      {
        $match: keyword,
      },
      {
        $group: {
          _id: "$_id",
          unseenMessagesCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$messages.sender", new mongoose.Types.ObjectId(userId)] },
                    { $in: ["$messages.status", ["unseen", "delivered"]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    return unseenCount;
  } catch (error) {}
};
//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
export const createGroupChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.users || !req.body.groupName) {
    return next(new CustomErrorHandler("GroupName or users cannot be empty!", 400));
  }

  var users = req.body.users;

  if (users.length < 2) {
    return next(
      new CustomErrorHandler("more than 2 users are required to form a group chat!", 400)
    );
  }

  users.push(req.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.groupName,
      users: users,
      isGroupChat: true,
      groupAdmin: req.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    console.log({ error });
    next(error);
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
export const renameGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      return next(new CustomErrorHandler("Chat not found!", 404));
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove or leave user when leave user reassign new random admin
// @access  Protected
export const removeFromGroup = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));

    // if (!isAdmin) {
    //   return next(new CustomErrorHandler("You are not the group admin!", 403));
    // }

    const removedUser = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId, groupAdmin: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removedUser) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    // Check if the removed user is in the groupAdmin array
    const isAdminLeave = removedUser.groupAdmin.some((adminId) => adminId.equals(userId));

    if (isAdminLeave) {
      console.log("An admin leaves the group");

      // If the removed user was in the groupAdmin array, update the groupAdmin array
      const newGroupAdmins = removedUser.groupAdmin.filter(
        (adminId) => !adminId.equals(userId)
      );

      if (newGroupAdmins.length === 0) {
        // If no admins are left, select a random user as the new admin
        const randomUser =
          removedUser.users[Math.floor(Math.random() * removedUser.users.length)];

        if (randomUser) {
          newGroupAdmins.push(randomUser._id);
        } else {
          // If no random user is found, make the first user in the list the admin
          newGroupAdmins.push(removedUser.users[0]?._id);
        }
      }

      // Update the groupAdmin field with the new admins
      await Chat.findByIdAndUpdate(
        chatId,
        {
          groupAdmin: newGroupAdmins,
        },
        {
          new: true,
        }
      );

      // Send response to the user when admin leaves

      // Check if all users have left the chat after admin leaves
      if (removedUser.users.length === 0) {
        await Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
        console.log("Chat Deleted!");
      }
      res.json({ isAdminLeave: true, data: removedUser });

      return; // Return to prevent the execution of the rest of the code
    }

    // Check if all users have left the chat, and if so, delete the chat
    if (removedUser.users.length === 0) {
      await Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
      console.log("Chat Deleted!");
    }

    res.json({ data: removedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    } else {
      res.json(added);
    }
  } catch (error) {
    next(error);
  }
};

//delete single chat one to one chat

export const deleteSingleChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId || !req.id) {
      return next(new CustomErrorHandler("ChatId Not found", 400));
    }
    const chat = await Chat.findById(req.params.chatId);
    await Message.deleteMany({ chat: req.params.chatId });
    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({
      success: true,
      chat: chat,
      receiverId: chat?.users.find((user) => user.toString() !== req.id)?._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

///make admin
export const makeAdmin = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));

    if (!isAdmin) {
      return next(new CustomErrorHandler("You are not the group admin!", 403));
    }
    // Check if userId is already an admin
    const isAlreadyAdmin = chat.groupAdmin.some((adminId) => adminId.equals(userId));

    if (isAlreadyAdmin) {
      return res.json({ message: "User is already an admin.", data: chat });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: { groupAdmin: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    res.json({ data: updatedChat });
  } catch (error) {
    next(error);
  }
};

//removeFromAdmin
export const removeFromAdmin = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    const isAdmin = chat.groupAdmin.some((adminId) => adminId.equals(req.id));

    if (!isAdmin) {
      return next(new CustomErrorHandler("You are not the group admin!", 403));
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { groupAdmin: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    res.json({ data: updatedChat });
  } catch (error) {
    next(error);
  }
};

//update Chat status as Blocked/Unblocked

export const updateChatStatusAsBlockOrUnblock = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, status } = req.body;
    if (!status || !chatId)
      return next(new CustomErrorHandler("chat Id or status cannot be empty!", 400));

    let updateQuery = {};

    if (status === "block") {
      updateQuery = {
        $addToSet: {
          chatBlockedBy: req.id,
        },
      };
    } else if (status === "unblock") {
      updateQuery = {
        $pull: {
          chatBlockedBy: req.id,
        },
      };
    } else {
      return next(new CustomErrorHandler("Invalid status!", 400));
    }

    const updatedChat = await Chat.findByIdAndUpdate(chatId, updateQuery, {
      new: true,
    }).populate("chatBlockedBy");
    res.status(200).json({
      chat: updatedChat,
      chatId: updatedChat?._id,
      receiverId: updatedChat?.users
        .find((user) => user.toString() !== req.id)
        ?._id.toString(),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//LeaveChat
export const leaveFromChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    );

    if (!updatedChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    res.json({ chat: updatedChat, userId });
  } catch (error) {
    next(error);
  }
};
//get users in a chat
export const getUsersInAChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;
  const search = req.query.search;

  try {
    let query: any = {
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: req.id } },
    };

    if (search) {
      query["$or"] = [
        { "users.name": { $regex: search, $options: "i" } },
        { "users.email": { $regex: search, $options: "i" } },
      ];
    }

    const users = await Chat.find(query).limit(limit).skip(skip);

    const chat = await Chat.findOne({ _id: req.params.chatId });
    const total = chat ? chat.users.length : 0;

    res.send({ users, total, limit });
  } catch (error) {
    next(error);
  }
};

//find files from a chat

export const getFilesInChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const filter = req.query.filter;
  try {
    const query: any = {
      chat: req.params.chatId,
    };

    if (filter === "all") {
      query.type = { $in: ["image", "application", "audio", "video"] };
    } else {
      query.type = filter;
    }

    const files = await Message.find(query).limit(limit).skip(skip);
    const total = await Message.countDocuments(query);
    res.send({ files, total, limit });
  } catch (error) {
    next(error);
  }
};
