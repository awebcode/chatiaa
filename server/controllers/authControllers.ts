import { v2 } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { User } from "../model/UserModel";
import fs from "fs";
import { Chat } from "../model/ChatModel";
import { AvatarGenerator } from "random-avatar-generator";
const register = async (req: Request | any, res: Response, next: NextFunction) => {
  const { name, password, email } = req.body;

  try {
    // Check if the username or email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new CustomErrorHandler("Username or email already exists", 400));
    }
      if (password.length<6) {
        return next(new CustomErrorHandler("Password must be at least 6 charecters!", 400));
      }
    // const url = await v2.uploader.upload(req.file.path);
    // const localFilePath = req.file.path;
    // fs.unlink(localFilePath, (err) => {
    //   if (err) {
    //     console.error(`Error deleting local file: ${err.message}`);
    //   } else {
    //     console.log(`Local file deleted: ${localFilePath}`);
    //   }
    // });
    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);
    const generator = new AvatarGenerator();

    // Simply get a random avatar
    const randomAvatarUrl = generator.generateRandomAvatar("avatar");
    // Save the user to the database using Mongoose model
    const newUser = new User({
      name,
      password: hashedPassword,
      email,
      image: randomAvatarUrl,
    }); //, pic: url.url
    const user = await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: user });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) {
      return next(new CustomErrorHandler("Invalid username or password", 401));
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
interface CustomRequest extends Request {
  id: any;
}
const getUser: any = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Access the authenticated user from the request
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

// const allUsers = async (req: CustomRequest | any, res: Response, next: NextFunction) => {
//   const limit = parseInt(req.query.limit) || 4;
//   const skip = parseInt(req.query.skip) || 0;

//   // Assuming you have a MongoDB model named 'User'
//   try {
//     const keyword = req.query.search
//       ? {
//           $or: [
//             { username: { $regex: req.query.search, $options: "i" } },
//             { email: { $regex: req.query.search, $options: "i" } },
//           ],
//         }
//       : {};

//     const users = await User.find(keyword)
//       .find({ _id: { $ne: req.id } })
//       .limit(limit)
//       .skip(skip);
//     const total = await User.countDocuments(keyword);

//     res.send({ users, total, limit });
//   } catch (error) {

//     res.status(500).send("Internal Server Error");
//   }
// };
const allUsers = async (req: CustomRequest | any, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit) || 4;
  const skip = parseInt(req.query.skip) || 0;

  // Assuming you have a MongoDB model named 'User'
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
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
            $and: [
              { _id: { $ne: req.id } },
              { ...keyword }, // Include the keyword fields here
            ],
          }
        : {
            $and: [
              { _id: { $ne: req.id } },
              { ...keyword }, // Include the keyword fields here
            ],
          };

    const users = await User.find(usersQuery).limit(limit).skip(skip);
    const total = await User.countDocuments(usersQuery);
    res.send({ users, total, limit });
  } catch (error) {
    next(error);
  }
};
export const logout = (req: CustomRequest | any, res: Response, next: NextFunction) => {
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
export { register, login, getUser, allUsers };
