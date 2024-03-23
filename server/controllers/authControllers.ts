import { v2 } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { User } from "../model/UserModel";
import { Chat } from "../model/ChatModel";
import { AvatarGenerator } from "random-avatar-generator";
const register = async (req: Request | any, res: Response, next: NextFunction) => {
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
    // Fetch avatar URL and upload it to Cloudinary
    const generator = new AvatarGenerator();
    const randomAvatarUrl = generator.generateRandomAvatar();
    const cloudinaryResponse = await v2.uploader.upload(randomAvatarUrl, {
      folder: "messengaria",
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
      provider:"credentials"
    }); //, image: url.url
    const user = await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: user });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
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


const allUsers = async (req: CustomRequest | any, res: Response, next: NextFunction) => {
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
    console.log(req.query);
    const total = await User.countDocuments(usersQuery);
    console.log({ total });
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

export const deleteUser = async (
  req: CustomRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req;
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return next(new CustomErrorHandler("No user found", 401));
    }

    // Check if the user has an associated image
    if (user.image&&user.provider==="credentials") {
      // Extract the public_id from the image URL
      const publicId = (user as any).image.split("/").pop().split(".")[0]

      // Delete the image from Cloudinary using the public_id
       await v2.uploader.destroy(publicId);
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({message:"User and associated image deleted successfully"})
  } catch (error) {
    next(error)
  }
};

export { register, login, getUser, allUsers };
