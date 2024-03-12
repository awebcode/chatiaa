import mongoose from "mongoose";

// Define the Account schema
const accountSchema = new mongoose.Schema({
  provider: { type: String },
  type: { type: String },
  providerAccountId: { type: String },
  access_token: { type: String },
  expires_at: { type: Date },
  refresh_token: { type: String },
  refresh_token_expires_in: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming you have a User model
});

// Create the Account model
const  AccountModel = mongoose.models.Account || mongoose.model("Account", accountSchema);

export default AccountModel