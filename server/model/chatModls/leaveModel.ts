import mongoose from "mongoose";

const leaveChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    leaveBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const leaveChatModel = mongoose.model("leavedChats", leaveChatSchema);
