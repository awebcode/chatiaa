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
    return next(new CustomErrorHandler("Chat Id or content cannot be empty!", 400))
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
    select: "name pic email lastActive",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "username email pic lastActive"
      );
      res.status(200).json(FullChat);
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
    const limit = parseInt(req.query.limit) || 4;
    const skip = parseInt(req.query.skip) || 0;
    const keyword: any = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
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
      users: { $elemMatch: { $eq: req.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .populate({
        path: "chatStatus.updatedBy",
        select: "username pic email lastActive",
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
   

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username pic email lastActive ",
      
    });
    // Filter the populatedChats array based on the keyword
    let filteredChats: any = [];
    if (req.query.search && keyword) {
      filteredChats = populatedChats.filter((chat: any) =>
        chat.users.some(
          (user: any) =>
            user.username.match(new RegExp(keyword.$or[0].username.$regex, "i")) ||
            user.email.match(new RegExp(keyword.$or[1].email.$regex, "i"))
        )
      );
    }

    res.status(200).send({
      chats:
        filteredChats.length > 0 ? filteredChats : req.query.search ? [] : populatedChats,
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
  if (!req.body.users || !req.body.name) {
    throw new CustomErrorHandler("Please Fill all the feilds!", 400);
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
      chatName: req.body.name,
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId || !(req as any).id) {
      return next(new CustomErrorHandler("ChatId Not found", 400));
    }
    const chat = await Chat.findById(req.params.chatId);
    await Message.deleteMany({ chat: req.params.chatId });
    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ success: true,users:chat?.users });
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
      return res.json({ message: "User is already an admin.",data:chat });
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
        $pull: {  groupAdmin: userId },
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
