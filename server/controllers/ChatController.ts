//@description     Create or fetch One to One Chat
//@route           POST /api/chat/

import { NextFunction, Request, Response } from "express";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { Chat } from "../model/ChatModel";
import { User } from "../model/UserModel";
import { Message } from "../model/MessageModel";
import mongoose from "mongoose";
import { getSeenByInfo } from "../common/seenByInfo";
import { AvatarGenerator } from "random-avatar-generator";
import { v2 } from "cloudinary";
import { io } from "..";
import { emitEventToGroupUsers } from "../common/groupSocket";
import { sentGroupNotifyMessage } from "./functions";
import { generateUpdateMessage } from "../common/generateUpdateMessage";
import { onlineUsersModel } from "../model/onlineUsersModel";
import { checkIfAnyUserIsOnline } from "../common/checkIsOnline";

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
  ///when use separate model for keep users reference for chat
  // const userChatExists = await UserChat.find({
  //   $or: [
  //     { userId: req.id, userId: userId },
  //     { userId: userId, userId: req.id },
  //   ],
  // }).populate("chatId");
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
    select: "name image email lastActive createdAt",
  });
  //check if any user is online
  const isOnline = await checkIfAnyUserIsOnline(isChat?.users, req.id);

  if (isChat.length > 0) {
    res.status(200).send({ chatData: { ...isChat[0].toObject(), isOnline } });
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
        "name email image lastActive createdAt"
      );
      const isOnline = await checkIfAnyUserIsOnline(FullChat?.users as any, req.id);
      res.status(201).json({
        success: true,
        isNewChat: true,
        chatData: { ...FullChat?.toObject(), isOnline },
      });
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
    // console.log({fetchChats:req.id})
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
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
    const unseenCount: any = await unseenMessagesCounts(limit, skip, keyword, req.id);
    // Count the total documents matching the keyword
    const totalDocs = await Chat.countDocuments({
      users: { $elemMatch: { $eq: req.id } },
    });
    //when i use keep users in chat to separate document
    //const totalDocs = await UserChat.countDocuments({ userId: req.id });

    // Find user-chat association documents for the current user
    // const userChats = await UserChat.find({ userId: req.id }).select("chatId");

    // // Extract chat IDs from user-chat association documents
    // const chatIds = userChats.map((userChat) => userChat.chatId);

    // // Perform the query to find chat documents based on the extracted chat IDs
    // const chats = await Chat.find({
    //   $or: [
    //     { _id: { $in: chatIds } }, // Find chats where the _id matches any of the extracted chat IDs
    //     { chatName: { $regex: req.query.search, $options: "i" } },
    //   ],
    // });
    // const user=await User.findById(req.id);
    const chats = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.id } } },
        { chatName: { $regex: req.query.search, $options: "i" } },
      ],
    })
      .populate({
        path: "users",
        select: "name email image createdAt lastActive",
        options: { limit: 10 }, // Set limit to Infinity to populate all documents
      })
      .populate("groupAdmin", "email name image createdAt lastActive")
      .populate("latestMessage")
      .populate("chatBlockedBy", "name image email createdAt lastActive")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip);
    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name image email lastActive createdAt lastActive",
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

    const filteredChatsWithUnseenCountPromises = filteredChats.map(async (chat: any) => {
      const correspondingUnseenCount = unseenCount.find(
        (count: any) => count._id.toString() === chat._id.toString()
      );
      //check if any user is online
      const isAnyUserOnline = await checkIfAnyUserIsOnline(chat?.users, req.id);
      try {
        const { seenBy, isLatestMessageSeen, totalSeenCount } = await getSeenByInfo(
          chat._id,
          chat?.latestMessage?._id,
          req.id
        );

        // Construct updated chat object with awaited results
        return {
          ...chat.toObject(),
          latestMessage: {
            ...chat.latestMessage?._doc,
            isSeen: !!isLatestMessageSeen,
            seenBy,
            totalseenBy: totalSeenCount || 0,
          },
          isOnline: isAnyUserOnline,
          unseenCount: correspondingUnseenCount
            ? correspondingUnseenCount.unseenMessagesCount
            : 0,
        };
      } catch (error) {
        // Handle errors if necessary
        console.error("Error:", error);
        return null; // Return null or any other default value if needed
      }
    });
    // Wait for all promises to resolve using Promise.all
    const resolvedFilteredChatsWithUnseenCount = await Promise.all(
      filteredChatsWithUnseenCountPromises
    );
    // Modify populatedChats to include unseenCount for each chat
    const populatedChatsWithUnseenCount = await Promise.all(
      populatedChats.map(async (chat: any) => {
        const correspondingUnseenCount = unseenCount.find(
          (count: any) => count._id.toString() === chat._id.toString()
        );
        // Check if any user in the chat is online

        const isAnyUserOnline = await checkIfAnyUserIsOnline(chat?.users, req.id);

        try {
          const { seenBy, isLatestMessageSeen, totalSeenCount } = await getSeenByInfo(
            chat._id,
            chat?.latestMessage?._id,
            req.id
          );

          // Construct updated chat object with awaited results
          const updatedChat = {
            ...chat.toObject(),
            latestMessage: {
              ...chat.latestMessage?._doc,
              isSeen: !!isLatestMessageSeen,
              seenBy,
              totalseenBy: totalSeenCount || 0,
            },
            isOnline: isAnyUserOnline,
            unseenCount: correspondingUnseenCount
              ? correspondingUnseenCount.unseenMessagesCount
              : 0,
          };

          return updatedChat;
        } catch (error) {
          // Handle errors if necessary
          console.error("Error:", error);
          return null; // Return null or any other default value if needed
        }
      })
    );
    // // Retrieve the IDs of the filtered users

    res.status(200).send({
      chats:
        filteredChats.length > 0
          ? resolvedFilteredChatsWithUnseenCount
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
    const generator = new AvatarGenerator();
    const randomAvatarUrl = generator.generateRandomAvatar();
    const cloudinaryResponse = await v2.uploader.upload(randomAvatarUrl, {
      folder: "messengaria",
      format: "png", // Specify the format as PNG
    });

    const groupChat = await Chat.create({
      chatName: req.body.groupName,
      users: users,
      image: {
        url: cloudinaryResponse.secure_url,
        public_id: cloudinaryResponse.public_id,
      },
      isGroupChat: true,
      groupAdmin: req.id,
    });
    //
    // Create user-chat associations for each user
    // await Promise.all(
    //   users.map(async (userId: string) => {
    //     // Check if the user exists
    //     const userExists = await User.exists({ _id: userId });
    //     if (!userExists) {
    //       throw new CustomErrorHandler(`User with ID ${userId} does not exist`, 404);
    //     }

    //     // Create the user-chat association document
    //     await UserChat.create({
    //       chatId: groupChat._id,
    //       userId: userId,
    //     });
    //   })
    // );
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

//
// @access  Protected updateGroupPhoto and name
export const updateGroupNamePhoto = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, groupName, description } = req.body;
    const foundChat = await Chat.findById(chatId);
    const currentUser = await User.findById(req.id);
    if (!currentUser) {
      return next(new CustomErrorHandler("User not found!", 404));
    }
    if (!foundChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    // Update chat image if req.file.path exists
    let imageUpdate = {};
    if (req.file?.path) {
      // Check if chat.image exists, if so, remove the previous image from cloudinary
      if (foundChat.image && foundChat.image.public_id) {
        await v2.uploader.destroy(foundChat.image.public_id as any);
      }

      const cloudinaryResponse = await v2.uploader.upload(req.file.path, {
        folder: "messengaria",
      });

      imageUpdate = {
        image: {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
      };
    }

    // Update chat name and description if provided
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        ...imageUpdate,
        chatName: groupName || foundChat.chatName,
        description: description || foundChat.description,
      },
      {
        new: true,
      }
    )
      .populate({
        path: "users",
        select: "name email image lastActive",
        options: { limit: 10 },
      })
      .populate("groupAdmin", "name email image lastActive");
    // //@@@ notify/emit-socket group members that who updated the group
    // Generate update message
    const message = generateUpdateMessage(
      currentUser,
      description,
      groupName,
      req.file?.path
    );
    if (message.trim() !== "") {
      const updateGroupMessage = await sentGroupNotifyMessage({
        chatId: chatId,
        user: req.id,
        message,
      });
      const updateGroupData = {
        message: { ...updateGroupMessage.toObject() },
        chatId,
      };
      await emitEventToGroupUsers(io, "groupNotifyReceived", chatId, updateGroupData);
    }
    //@@@ notify/emit socket group members that who updated the group
    res.json(updatedChat);
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
      }
      res.json({ isAdminLeave: true, data: removedUser });

      return; // Return to prevent the execution of the rest of the code
    }

    // Check if all users have left the chat, and if so, delete the chat
    if (removedUser.users.length === 0) {
      await Chat.findByIdAndDelete(chatId).exec(); // Ensure the delete operation is awaited
    }

    res.json({ data: removedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userIds } = req.body;
    //
    const currentUser = await User.findById(req.id);

    // Check if the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    const newUsers = [];

    // Loop through userIds and add users who are not already members
    for (const userId of userIds) {
      if (!chat.users.includes(userId)) {
        newUsers.push(userId);
      }
    }

    // If all users are already members, return a message
    if (newUsers.length === 0) {
      return res
        .status(400)
        .json({ message: "All users are already members of the group" });
    }

    // Add new users to the group
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: { $each: newUsers } },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "users",
        select: "name email image lastActive",
        options: { limit: 10 },
      })
      .populate("groupAdmin", "name email image lastActive");

    if (!added) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    } else {
      //@@@ notify group members that who added in group

      for (const userId of userIds) {
        const user = await User.findById(userId);
        const addUsersToGroupMessage = await sentGroupNotifyMessage({
          chatId: chatId,
          user: req.id,
          message: `${currentUser?.name} added ${user?.name} to the group `,
        });
        const addUsersToGroupData = {
          message: { ...addUsersToGroupMessage.toObject() },
          user,
          chatId,
        };
        await emitEventToGroupUsers(
          io,
          "groupNotifyReceived",
          chatId,
          addUsersToGroupData
        );
        //@@@ notify group members that who added in group
      }
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
      .populate({
        path: "users",
        select: "name email image lastActive",
        options: { limit: 10 },
      })
      .populate("groupAdmin", "name email image lastActive");

    if (!updatedChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    res.json({ data: updatedChat });
  } catch (error) {
    next(error);
  }
};
//remove from group admin
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

    // Remove the user from the groupAdmin array
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { groupAdmin: userId },
      },
      {
        new: true,
      }
    );

    if (!updatedChat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    // Check if there are no remaining admins
    if (updatedChat.groupAdmin.length === 0) {
      // Select two random users from the chat's users array, excluding the leaving admin
      const usersCount = updatedChat.users.length;
      const leavingAdminIndex = updatedChat.users.findIndex((user) =>
        user._id.equals(userId)
      );
      const randomAdmins = [];

      if (usersCount > 0) {
        // Select two random users as admins, excluding the leaving admin
        for (let i = 0; i < 2; i++) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * usersCount);
          } while (randomIndex === leavingAdminIndex); // Ensure the leaving admin is not selected
          randomAdmins.push(updatedChat.users[randomIndex]._id);
        }
      }

      // Update the groupAdmin field with the new admins
      await Chat.findByIdAndUpdate(
        chatId,
        {
          $addToSet: { groupAdmin: { $each: randomAdmins } },
        },
        {
          new: true,
        }
      );

      // Send response indicating new group admins
      res.json({ newGroupAdmins: randomAdmins, data: updatedChat });

      return;
    }

    // Send response indicating successful removal
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
    const chat = await Chat.findById({ _id: req.params.chatId });

    let findChatQuery = await Chat.findOne({ _id: req.params.chatId }).populate({
      path: "users",
      select: "-password",
      match: {
        $or: [
          { name: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },
        ],
      },
      options: { limit, skip },
    });

    const total = chat ? chat.users.length : 0;
    // Check online status for each user
    const usersWithOnlineStatus = await Promise.all(
      (findChatQuery?.users || []).map(async (user: any) => {
        const isOnline = await onlineUsersModel.findOne({ userId: user?._id });
        return { ...user.toObject(), isOnline };
      })
    );

    res.send({ users: usersWithOnlineStatus, total, limit });
  } catch (error) {
    next(error);
  }
};
//find inital files from a chat

export const getInitialFilesInChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = await Message.find({
      chat: req.params.chatId,
      type: "image",
    })
      .select("file") // Select only the 'file' field
      .sort({ updatedAt: -1 })
      .limit(5);
    const total = await Message.countDocuments({
      type: { $in: ["image", "application", "audio", "video"] },
    });
    res.send({ files, total });
  } catch (error) {
    console.log({ error });
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

    const files = await Message.find(query)
      .sort({ updatedAt: -1 })
      .select("file type")
      .populate("sender", "image name email createdAt")
      .limit(limit)
      .skip(skip);
    const total = await Message.countDocuments(query);
    const totalImages = await Message.countDocuments({
      chat: req.params.chatId,
      type: "image",
    });
    const totalAudios = await Message.countDocuments({
      chat: req.params.chatId,
      type: "audio",
    });
    const totalVideos = await Message.countDocuments({
      chat: req.params.chatId,
      type: "video",
    });
    const totalDocuments = await Message.countDocuments({
      chat: req.params.chatId,
      type: "application",
    });

    res.send({
      files,
      total,
      limit,
      totalImages,
      totalAudios,
      totalVideos,
      totalDocuments,
    });
  } catch (error) {
    next(error);
  }
};

//update oncallmembers count

//onCallMembersCount

export const onCallMembersCount = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const chat = await Chat.findById(req.body.chatId);
    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    // Update onCallMembers count based on join or leave action
    // Update onCallMembers count based on join or leave action
    if (req.body.type === "join") {
      chat.onCallMembers += 1;
    } else {
      // Ensure not to decrease onCallMembers below 0
      chat.onCallMembers = Math.max(chat.onCallMembers - 1, 0);
    }

    // Save the updated chat object
    await chat.save();

    res.send({ chat });
  } catch (error) {
    console.log({ error });
    next(error);
  }
};

//deleteAllMessagesInACh
export const deleteAllMessagesInAChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: req.id } },
    });

    if (!chat) {
      return next(new CustomErrorHandler("Chat not found!", 404));
    }

    // Find all messages in the chat that have a file attached
    const messagesWithFiles = await Message.find({
      chat: chatId,
      file: { $exists: true },
    });

    // Delete files from cloud storage and collect public_ids
    const publicIds = messagesWithFiles.map((message:any) => message?.file?.public_id );
    await Promise.all(
      publicIds.map((public_id) => v2.uploader.destroy(public_id))
    );
    await Message.deleteMany({ chat: chatId });

    res.json({
      success: true,
      message: "All Messages are deleted!",
    });
  } catch (error) {
    next(error);
  }
};
