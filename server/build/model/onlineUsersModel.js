"use strict";
// socketModel.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsersModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Define schema for socket connections
const onlineUsersSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true, // Define index on userId
    },
    socketId: {
        type: String,
        required: true,
        unique: true,
        index: true, // Define index on userId
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// Create and export Socket model based on the schema
exports.onlineUsersModel = mongoose_1.default.model("onlineUsers", onlineUsersSchema);
