import mongoose from "mongoose";

const chatModel = new mongoose.Schema(
  {
    chatName: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    image: { public_id: String, url: String },
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chatBlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    description: String,
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatModel);
