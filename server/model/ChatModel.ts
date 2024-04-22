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
    onCallMembers: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// Define a schema for user-chat associations
const chatUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
});
export const ChatUser = mongoose.model("ChatUser", chatUserSchema);
export const Chat = mongoose.model("Chat", chatModel);
