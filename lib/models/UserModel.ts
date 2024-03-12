import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String,  required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    image: {
      type: "String",
    
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      // default: Date.now,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
