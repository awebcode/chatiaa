"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Define the storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads"); // Set the destination folder
    },
    filename: (req, file, cb) => {
        console.log({ file });
        cb(null, `${Date.now() + "--chatapp-filename"}-${file.originalname}`); // Define the filename
    },
});
// Define the file filter function
// Define the file filter function
const fileFilter = (req, file, cb) => {
    // Check file types, for example, allow only images
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/x-icon") {
        cb(null, true); // Accept the file
    }
    else {
        console.log("Only images (jpeg, jpg, png,x-icon|ico) are allowed!", file);
        cb(new Error("Only images (jpeg, jpg, png,x-icon|ico) are allowed!"), false); // Reject the file
    }
};
// Set up multer with the storage configuration and file filter
const uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Specify fileSize as an object
});
exports.default = uploadMiddleware;
