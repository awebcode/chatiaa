// socketModel.js

import mongoose from "mongoose";

// Define schema for socket connections
const onlineUsersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true, // Define index on userId
  },
  socketId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Define index on userId
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export Socket model based on the schema
export const onlineUsersModel = mongoose.model("onlineUsers", onlineUsersSchema);
