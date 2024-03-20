import mongoose from "mongoose";

const blockChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const BlockChatModel = mongoose.model("blockedChats", blockChatSchema);
