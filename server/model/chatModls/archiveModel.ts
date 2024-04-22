import mongoose from "mongoose";

const archiveChatSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: { type: String },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const archiveChatModel = mongoose.model("archivedChats", archiveChatSchema);
