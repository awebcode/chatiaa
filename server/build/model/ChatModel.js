"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatStatusChangeSchema = new mongoose_1.default.Schema({
    status: { type: String, enum: ["blocked", "unblocked", "muted", "leave", "archive"] },
    mutedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    blockedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    leaveBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    deleteBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    archiveBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    markAsUnreadBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
const chatModel = new mongoose_1.default.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupAdmin: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    chatStatus: [chatStatusChangeSchema],
}, { timestamps: true });
exports.Chat = mongoose_1.default.model("Chat", chatModel);
