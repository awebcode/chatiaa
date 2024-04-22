"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel = new mongoose_1.default.Schema({
    chatName: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    image: { public_id: String, url: String },
    groupAdmin: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    chatBlockedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    description: String,
    onCallMembers: { type: Number, default: 0 },
}, { timestamps: true });
// Define a schema for user-chat associations
const chatUserSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    chatId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" },
});
exports.ChatUser = mongoose_1.default.model("ChatUser", chatUserSchema);
exports.Chat = mongoose_1.default.model("Chat", chatModel);
