"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSeenBy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSeenSchema = new mongoose_1.default.Schema({
    chatId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" },
    messageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.MessageSeenBy = mongoose_1.default.model("MessageSeenby", messageSeenSchema);
