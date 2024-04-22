import mongoose from "mongoose";

const mutedChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    mutedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const mutedChatModel = mongoose.model("mutedChats", mutedChatSchema);
