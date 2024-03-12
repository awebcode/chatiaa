// Import mongoose

import mongoose from "mongoose";

// Create a Mongoose Schema for Reactions
const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true }, // Emoji associated with the reaction
    reactBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who reacted
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true }, // Reference to the reacted message
  },
  { timestamps: true }
);

// Create a Mongoose Model for Reactions
export const Reaction = mongoose.model("Reaction", reactionSchema);
