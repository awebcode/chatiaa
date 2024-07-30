import { v2 } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { User } from "../model/UserModel";
import { Chat } from "../model/ChatModel";
import { AvatarGenerator } from "random-avatar-generator";
import AccountModel from "../model/AccountModel";
const register = async (req: Request|any, res: Response, next: NextFunction) => {
  const { name, password, email } = req.body;

  try {
    // Check if the name or email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new CustomErrorHandler("name or email already exists", 400));
    }
    if (password.length < 6) {
      return next(new CustomErrorHandler("Password must be at least 6 charecters!", 400));
    }

    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);
    // Fetch avatar URL and upload it to Cloudinary
    const generator = new AvatarGenerator();
    const randomAvatarUrl = generator.generateRandomAvatar();
    const cloudinaryResponse = await v2.uploader.upload(randomAvatarUrl, {
      folder: "Chatiaa",
      format: "png", // Specify the format as PNG
    });

    // Get the secure URL of the uploaded image from Cloudinary
    const avatarUrl = cloudinaryResponse.secure_url;
    // Save the user to the database using Mongoose model
    const newUser = new User({
      name,
      password: hashedPassword,
      email,
      image: avatarUrl,
      provider: "credentials",
    }); //, image: url.url
    const user = await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: user });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

const login = async (req: Request|any, res: Response, next: NextFunction) => {
  const { name, password } = req.body;

  try {
    // Find the user by name
    const user = await User.findOne({ name });

    // Check if the user exists
    if (!user) {
      return next(new CustomErrorHandler("Invalid name or password", 401));
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Check if the password is valid
    if (!isPasswordValid) {
      return next(new CustomErrorHandler("Invalid password", 401));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "your-secret-key", { expiresIn: "6h" });
    res.cookie("authToken", token, {
      expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
      secure: true,
      sameSite: "none",
      httpOnly: true,
    }); // 6 hours expiration
    res.status(200).json({ token, user });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

const getUser: any = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    // Access the authenticated user from the request
    //with serverside in next js req.id not work you can use getserversession for accessing user
    const { id } = req;
    const user = await User.findOne({ _id: id });

    if (!user) {
      return next(new CustomErrorHandler("Unauthorized - No user found", 401));
    }

    // You can fetch additional user details from your database or any other source
    // For demonstration purposes, we are returning the basic user information

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
//get profile
export const getProfile: any = async (
  req: Request|any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Access the authenticated user from the request

    const user = await User.findOne({ _id: req.params.userId });

    if (!user) {
      return next(new CustomErrorHandler("User does not exists", 401));
    }

    // You can fetch additional user details from your database or any other source
    // For demonstration purposes, we are returning the basic user information

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
const allUsers = async (req: Request|any, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit) || 4;
  const skip = parseInt(req.query.skip) || 0;
  // Assuming you have a MongoDB model named 'User'
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    //when search for find group users then check only find users who exist in my chat
    const usersQuery =
      req.query.onGroupSearch === "true"
        ? {
            _id: {
              $in: (await Chat.find({ users: { $elemMatch: { $eq: req.id } } }))
                .map((chat) => chat.users)
                .flat(),
            },
            $and: [{ _id: { $ne: req.id } }, { ...keyword }],
          }
        : {
            $and: [{ _id: { $ne: req.id } }, { ...keyword }],
          };
    const users = await User.find(usersQuery).limit(limit).skip(skip);
    const total = await User.countDocuments(usersQuery);
    const totalOnlineUsers = await User.countDocuments({
      onlineStatus: { $in: ["online", "busy"] },
    });
    res.send({ users, total, limit, totalOnlineUsers });
  } catch (error) {
    next(error);
  }
};

//find for adding in group who not exists in chat

export const allUsersForAddgroupExclueWhoinAlreadyChat = async (
  req: Request|any,
  res: Response,
  next: NextFunction
) => {
  const limit = parseInt(req.query.limit) || 4;
  const skip = parseInt(req.query.skip) || 0;
  const chatId = req.params.chatId;

  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Find users that are not part of the chat
    const usersQuery: any = {
      _id: { $nin: (await Chat.findById(chatId))?.users }, // Exclude users who are part of the chat
      $and: [{ _id: { $ne: req.id } }, { ...keyword }],
    };

    const users = await User.find(usersQuery).limit(limit).skip(skip);
    const total = await User.countDocuments(usersQuery);
    res.send({ users, total, limit });
  } catch (error) {
    next(error);
  }
};
//all users for admin

export const allAdminUsers = async (
  req: Request|any,
  res: Response,
  next: NextFunction
) => {
  const limit = parseInt(req.query.limit) || 4;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const adminUser = await User.findById(req.id);
    if (!adminUser || adminUser.role !== "admin") {
      return next(new CustomErrorHandler("You are not an admin", 401));
    }
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Find filtered users
    let users: any = await User.find({ ...keyword })
      .limit(limit)
      .skip(skip);

    // Count total documents matching the keyword
    const total = await User.countDocuments({ ...keyword });

    // Retrieve the IDs of the filtered users
    const userIds = users.map((user: any) => user._id);

    // Query onlineUsersModel for online status of filtered users
    const onlineUsers = await User.find({
      _id: { $in: userIds },
      onlineStatus: { $in: ["online", "busy"] },
    });

    // Map the online status to userIds
    const onlineUserIds = onlineUsers.map((user) => user?._id?.toString());

    // Merge online status into user data
    users = users.map((user: any) => ({
      ...user.toObject(),
      isOnline: onlineUserIds.includes(user._id.toString()),
    }));

    // Count total online users
    const totalOnlineUsers = await User.countDocuments({
      onlineStatus: { $in: ["online", "busy"] },
    });

    res.send({ users, total, limit, totalOnlineUsers });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request|any, res: Response, next: NextFunction) => {
  res.cookie("authToken", "", {
    expires: new Date(0),
    secure: true,
    httpOnly: true,
    sameSite: "none",
  });
  res.clearCookie("authToken");
  // You can also do additional cleanup or handle other logout logic if needed

  // Respond with a success message or any other relevant information
  res.status(200).json({ message: "Logout successful" });
};

export const deleteUser = async (
  req: Request|any,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = await User.findById(req.id);
    if (!currentUser) {
      return next(new CustomErrorHandler("You are not authorized", 401));
    }
    const { id: userId } = req;
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return next(new CustomErrorHandler("No user found", 401));
    }

    // Check if the user has an associated image
    if (user.image && user.provider === "credentials") {
      // Extract the public_id from the image URL
      const publicId = (user as any).image.split("/").pop().split(".")[0];

      // Delete the image from Cloudinary using the public_id
      await v2.uploader.destroy(publicId);
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId);
    await AccountModel.findOneAndDelete({ userId });

    res.status(200).json({ message: "User and associated image deleted successfully" });
  } catch (error) {
    next(error);
  }
};
//Delete user by admin

export const deleteUserByAdmin = async (
  req: Request|any,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = await User.findById(req.id);
    if (!currentUser) {
      return next(new CustomErrorHandler("You are not authorized", 401));
    }
    if (currentUser.role !== "admin") {
      return next(new CustomErrorHandler("You are not admin", 401));
    }
    const { userId } = req.params;
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return next(new CustomErrorHandler("No user found", 401));
    }

    // Check if the user has an associated image
    if (user.image && user.provider === "credentials") {
      // Extract the public_id from the image URL
      const publicId = (user as any).image.split("/").pop().split(".")[0];

      // Delete the image from Cloudinary using the public_id
      await v2.uploader.destroy(publicId);
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId);
    await AccountModel.findOneAndDelete({ userId });
    res.status(200).json({ message: "User and associated image deleted successfully" });
  } catch (error) {
    next(error);
  }
};
// @access  Protected updateUser
export const updateUser = async (req: Request|any, res: Response, next: NextFunction) => {
  try {
    const { userId, name, password, bio, role } = req.body;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return next(new CustomErrorHandler("User not found!", 404));
    }

    // Update chat image if req.file.path exists
    let imageUpdate: string | undefined;
    if (req.file?.path) {
      // Check if chat.image exists, if so, remove the previous image from cloudinary
      // Check if the user has an associated image
      if (currentUser.image && currentUser.provider === "credentials") {
        // Extract the public_id from the image URL
        const publicId = (currentUser as any).image.split("/").pop().split(".")[0];

        // Delete the image from Cloudinary using the public_id
        await v2.uploader.destroy(publicId);
      }
      const cloudinaryResponse = await v2.uploader.upload(req.file.path, {
        folder: "Chatiaa",
      });

      imageUpdate = cloudinaryResponse.secure_url;
    }
    let hashedPassword: string | undefined;

    if (password) {
      // Hash the provided password
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user's name, bio, photo, and password if provided, otherwise keep the existing data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(imageUpdate && { image: imageUpdate }),
        ...(name && { name: name }),
        ...(bio && { bio: bio }),
        ...(role && { role: role }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// getOnlineUsersInMyChats
export const getOnlineUsersInMyChats = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10, skip = 0, search } = req.query;
    const limitNumber = parseInt(limit) || 10;
    const skipNumber = parseInt(skip) || 0;
    const searchTerm = search?.toString() || "";

    // Build search criteria for name and email if searchTerm is provided
    const searchCriteria = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    // Find user chats where the current user is present and it's not a group chat
    const userChats = await Chat.find({ users: req.id, isGroupChat: false })
      .select("users")
      .lean();

    // Extract unique user IDs from chats, excluding the current user's ID
    const userIdsInChats = userChats.reduce((acc: string[], chat) => {
      chat.users.forEach((userId) => {
        if (userId !== req.id && !acc.includes(userId.toString())) {
          acc.push(userId.toString());
        }
      });
      return acc;
    }, []);

    // Find online users among the extracted user IDs with pagination
    const onlineUsersQuery = {
      _id: { $in: userIdsInChats },
      onlineStatus: { $in: ["online", "busy"] },
      ...searchCriteria,
    };

    const onlineUsers = await User.find(onlineUsersQuery)
      .sort({ updatedAt: -1 })
      .limit(limitNumber)
      .skip(skipNumber)
      .lean();

    // Count total online users matching the search criteria
    const totalOnlineUsers = await User.countDocuments(onlineUsersQuery);

    // Send the list of online users along with total count
    res.send({ onlineUsers, totalOnlineUsers, limit: limitNumber, skip: skipNumber });
  } catch (error) {
    next(error);
  }
};

export { register, login, getUser, allUsers };
