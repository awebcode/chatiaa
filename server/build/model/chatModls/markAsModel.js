"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsChatModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const markAsChatSchema = new mongoose_1.default.Schema({
    chatId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    markAsBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.markAsChatModel = mongoose_1.default.model("markAsChats", markAsChatSchema);
