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
exports.allUsers = exports.getUser = exports.login = exports.register = exports.deleteUser = exports.logout = exports.allUsersForAddgroupExclueWhoinAlreadyChat = exports.getProfile = void 0;
const cloudinary_1 = require("cloudinary");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middlewares/errorHandler");
const UserModel_1 = require("../model/UserModel");
const ChatModel_1 = require("../model/ChatModel");
const random_avatar_generator_1 = require("random-avatar-generator");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, email } = req.body;
    try {
        // Check if the name or email is already taken
        const existingUser = yield UserModel_1.User.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.CustomErrorHandler("name or email already exists", 400));
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
        // Fetch avatar URL and upload it to Cloudinary
        const generator = new random_avatar_generator_1.AvatarGenerator();
        const randomAvatarUrl = generator.generateRandomAvatar();
        const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(randomAvatarUrl, {
            folder: "messengaria",
            format: "png", // Specify the format as PNG
        });
        // Get the secure URL of the uploaded image from Cloudinary
        const avatarUrl = cloudinaryResponse.secure_url;
        // Save the user to the database using Mongoose model
        const newUser = new UserModel_1.User({
            name,
            password: hashedPassword,
            email,
            image: avatarUrl,
            provider: "credentials",
        }); //, image: url.url
        const user = yield newUser.save();
        res.status(201).json({ message: "User registered successfully", user: user });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        // Find the user by name
        const user = yield UserModel_1.User.findOne({ name });
        // Check if the user exists
        if (!user) {
            return next(new errorHandler_1.CustomErrorHandler("Invalid name or password", 401));
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
//get profile
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access the authenticated user from the request
        const user = yield UserModel_1.User.findOne({ _id: req.params.userId });
        if (!user) {
            return next(new errorHandler_1.CustomErrorHandler("User does not exists", 401));
        }
        // You can fetch additional user details from your database or any other source
        // For demonstration purposes, we are returning the basic user information
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const allUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log(req.query);
        //when search for find group users then check only find users who exist in my chat
        const usersQuery = req.query.onGroupSearch === "true"
            ? {
                _id: {
                    $in: (yield ChatModel_1.Chat.find({ users: { $elemMatch: { $eq: req.id } } }))
                        .map((chat) => chat.users)
                        .flat(),
                },
                $and: [{ _id: { $ne: req.id } }],
            }
            : {
                $and: [{ _id: { $ne: req.id } }, Object.assign({}, keyword)],
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
//find for adding in group who not exists in chat
const allUsersForAddgroupExclueWhoinAlreadyChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const usersQuery = {
            _id: { $nin: (_a = (yield ChatModel_1.Chat.findById(chatId))) === null || _a === void 0 ? void 0 : _a.users }, // Exclude users who are part of the chat
            $and: [{ _id: { $ne: req.id } }, Object.assign({}, keyword)],
        };
        const users = yield UserModel_1.User.find(usersQuery).limit(limit).skip(skip);
        const total = yield UserModel_1.User.countDocuments(usersQuery);
        res.send({ users, total, limit });
    }
    catch (error) {
        next(error);
    }
});
exports.allUsersForAddgroupExclueWhoinAlreadyChat = allUsersForAddgroupExclueWhoinAlreadyChat;
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
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userId } = req;
        // Find the user by ID
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return next(new errorHandler_1.CustomErrorHandler("No user found", 401));
        }
        // Check if the user has an associated image
        if (user.image && user.provider === "credentials") {
            // Extract the public_id from the image URL
            const publicId = user.image.split("/").pop().split(".")[0];
            // Delete the image from Cloudinary using the public_id
            yield cloudinary_1.v2.uploader.destroy(publicId);
        }
        // Delete the user from the database
        yield UserModel_1.User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User and associated image deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
