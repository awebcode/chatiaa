"use strict";
// Import mongoose
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Create a Mongoose Schema for Reactions
const reactionSchema = new mongoose_1.default.Schema({
    emoji: { type: String, required: true }, // Emoji associated with the reaction
    reactBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true }, // User who reacted
    messageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message", required: true }, // Reference to the reacted message
}, { timestamps: true });
// Create a Mongoose Model for Reactions
exports.Reaction = mongoose_1.default.model("Reaction", reactionSchema);
