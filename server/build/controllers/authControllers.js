"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allUsers = exports.getUser = exports.login = exports.register = exports.logout = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middlewares/errorHandler");
const UserModel_1 = require("../model/UserModel");
const ChatModel_1 = require("../model/ChatModel");
const random_avatar_generator_1 = require("random-avatar-generator");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, email } = req.body;
    try {
        // Check if the username or email is already taken
        const existingUser = yield UserModel_1.User.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.CustomErrorHandler("Username or email already exists", 400));
        }
        if (password.length < 6) {
            return next(new errorHandler_1.CustomErrorHandler("Password must be at least 6 charecters!", 400));
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
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const generator = new random_avatar_generator_1.AvatarGenerator();
        // Simply get a random avatar
        const randomAvatarUrl = generator.generateRandomAvatar("avatar");
        // Save the user to the database using Mongoose model
        const newUser = new UserModel_1.User({
            name,
            password: hashedPassword,
            email,
            image: randomAvatarUrl,
        }); //, pic: url.url
        const user = yield newUser.save();
        res.status(201).json({ message: "User registered successfully", user: user });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const user = yield UserModel_1.User.findOne({ username });
        // Check if the user exists
        if (!user) {
            return next(new errorHandler_1.CustomErrorHandler("Invalid username or password", 401));
        }
        // Compare the hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        // Check if the password is valid
        if (!isPasswordValid) {
            return next(new errorHandler_1.CustomErrorHandler("Invalid password", 401));
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, "your-secret-key", { expiresIn: "6h" });
        res.cookie("authToken", token, {
            expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
            secure: true,
            sameSite: "none",
            httpOnly: true,
        }); // 6 hours expiration
        res.status(200).json({ token, user });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }
});
exports.login = login;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access the authenticated user from the request
        const { id } = req;
        const user = yield UserModel_1.User.findOne({ _id: id });
        if (!user) {
            return next(new errorHandler_1.CustomErrorHandler("Unauthorized - No user found", 401));
        }
        // You can fetch additional user details from your database or any other source
        // For demonstration purposes, we are returning the basic user information
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
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
const allUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const usersQuery = req.query.onGroupSearch === "true"
            ? {
                _id: {
                    $in: (yield ChatModel_1.Chat.find({ users: { $elemMatch: { $eq: req.id } } }))
                        .map((chat) => chat.users)
                        .flat(),
                },
                $and: [
                    { _id: { $ne: req.id } },
                    Object.assign({}, keyword),
                ],
            }
            : {
                $and: [
                    { _id: { $ne: req.id } },
                    Object.assign({}, keyword),
                ],
            };
        const users = yield UserModel_1.User.find(usersQuery).limit(limit).skip(skip);
        const total = yield UserModel_1.User.countDocuments(usersQuery);
        res.send({ users, total, limit });
    }
    catch (error) {
        next(error);
    }
});
exports.allUsers = allUsers;
const logout = (req, res, next) => {
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
exports.logout = logout;
