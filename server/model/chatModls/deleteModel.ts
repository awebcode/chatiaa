import mongoose from "mongoose";

const deleteChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const deleteChatModel = mongoose.model("deletedChats", deleteChatSchema);
