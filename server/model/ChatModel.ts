import mongoose from "mongoose";
const chatStatusChangeSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["blocked", "unblocked", "muted", "leave", "archive"] },
    mutedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    leaveBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deleteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    archiveBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    markAsUnreadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const chatModel = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chatStatus: [chatStatusChangeSchema],
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatModel);
