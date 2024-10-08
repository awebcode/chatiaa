import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    tempMessageId:String, //for update user/sender ui instantly
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true, default: "" },
    type: { type: String, required: true },
    file: { public_Id: String, url: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unsentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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
        "seen",
        "removed",
        "removeFromAll",
        "reBack",
        "unsent",

        // this two will call when leave or remove user from group
        "removedByAdmin",
        "notify",
        "call-notify"
      ],
      default: "unseen",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
