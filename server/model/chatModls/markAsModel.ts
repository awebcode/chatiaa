import mongoose from "mongoose";

const markAsChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    markAsBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const markAsChatModel = mongoose.model("markAsChats", markAsChatSchema);
