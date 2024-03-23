import mongoose from "mongoose";
const chatBlockStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["blocked", "unblocked"] },
});
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
    chatBlockStatus: [chatBlockStatusSchema],
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatModel);
