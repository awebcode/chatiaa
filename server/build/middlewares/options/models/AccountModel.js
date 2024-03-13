"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the Account schema
const accountSchema = new mongoose_1.default.Schema({
    provider: { type: String },
    type: { type: String },
    providerAccountId: { type: String },
    access_token: { type: String },
    expires_at: { type: Date },
    refresh_token: { type: String },
    refresh_token_expires_in: { type: Number },
    token_type: { type: String },
    scope: { type: String },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }, // Assuming you have a User model
});
// Create the Account model
const AccountModel = mongoose_1.default.models.Account || mongoose_1.default.model("Account", accountSchema);
exports.default = AccountModel;
