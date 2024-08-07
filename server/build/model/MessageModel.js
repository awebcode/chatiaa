"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    tempMessageId: String, //for update user/sender ui instantly
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true, default: "" },
    type: { type: String, required: true },
    file: { public_Id: String, url: String },
    chat: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" },
    removedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    unsentBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    isReply: {
        repliedBy: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
        messageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" },
    },
    isEdit: {
        editedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
        messageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" },
    },
    status: {
        type: String,
        enum: [
            "seen",
            "unseen",
            "delivered",
            "seen",
            "removed",
            "removeFromAll",
            "reBack",
            "unsent",
            // this two will call when leave or remove user from group
            "removedByAdmin",
            "notify",
            "call-notify"
        ],
        default: "unseen",
    },
}, { timestamps: true });
exports.Message = mongoose_1.default.model("Message", messageSchema);
