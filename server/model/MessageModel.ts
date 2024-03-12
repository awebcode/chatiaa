import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    type: { type: String, required: true },
    image: { public_Id: String, url: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unsentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isReply: {
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    },
    isEdit: {
      editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    },
    status: {
      type: String,
      enum: [
        "seen",
        "unseen",
        "delivered",
        "remove",
        "removeFromAll",
        "reBack",
        "unsent",
        "block",
        "unblock",
      ],
      default: "unseen",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
