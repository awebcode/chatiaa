import mongoose from "mongoose";

const messageSeenSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const MessageSeenBy = mongoose.model("MessageSeenby", messageSeenSchema);
