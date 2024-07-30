"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allInitMessages = void 0;
const messageController_1 = require("../controllers/messageController");
const MessageModel_1 = require("../model/MessageModel");
const reactModal_1 = require("../model/reactModal");
const seenByModel_1 = require("../model/seenByModel");
//@ allInitMessages         Protected
const allInitMessages = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = 12;
        const page = 1;
        const skip = 0;
        // Fetch messages with necessary data only
        let messages = yield MessageModel_1.Message.find({ chat: chatId })
            .populate([
            {
                path: "isReply.messageId",
                select: "content file type sender",
                populate: {
                    path: "sender",
                    select: "name image email lastActive onlineStatus",
                },
            },
            {
                path: "isReply.repliedBy",
                select: "name image email lastActive onlineStatus",
            },
            {
                path: "isEdit.messageId",
                select: "content file type sender",
                populate: {
                    path: "sender",
                    select: "name image email lastActive onlineStatus",
                },
            },
            {
                path: "isEdit.editedBy",
                select: "name image email lastActive onlineStatus",
            },
            {
                path: "sender",
                select: "name image email lastActive onlineStatus",
            },
            {
                path: "removedBy",
                select: "name image email lastActive onlineStatus",
            },
            {
                path: "unsentBy",
                select: "name image email lastActive onlineStatus",
            },
        ])
            .sort({ _id: -1 })
            .limit(limit)
            .skip(skip);
        // Populate reactions and seenBy data for each message
        messages = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            const { reactionsGroup, totalReactions } = yield (0, messageController_1.countReactionsGroupForMessage)(message._id);
            // Fetch reactions and seenBy in parallel for efficiency
            const [reactions, seenBy] = yield Promise.all([
                reactModal_1.Reaction.find({ messageId: message._id })
                    .populate({
                    path: "reactBy",
                    select: "name image email lastActive onlineStatus",
                    options: { limit: 10 },
                })
                    .sort({ updatedAt: -1 })
                    .exec(),
                seenByModel_1.MessageSeenBy.find({ messageId: message._id })
                    .populate({
                    path: "userId",
                    select: "name image email lastActive onlineStatus",
                    options: { limit: 10 },
                })
                    .sort({ updatedAt: -1 })
                    .exec(),
            ]);
            // Total seenBy count
            const totalseenBy = seenBy.length;
            return Object.assign(Object.assign({}, message.toObject()), { reactions,
                reactionsGroup,
                totalReactions,
                seenBy,
                totalseenBy });
        })));
        // Count total number of messages for pagination
        const total = yield MessageModel_1.Message.countDocuments({ chat: chatId });
        return { messages, total, limit, page, skip };
    }
    catch (error) {
        console.log({ error });
        throw new Error("Error fetching messages");
    }
});
exports.allInitMessages = allInitMessages;
// export const allInitMessages = async (
//  chatId:string
// ) => {
//   try {
//     const limit =  12;
//     const page = 1;
//     // const skip = (page - 1) * limit;
//     const skip =  0;
//     let messages: any = await Message.find({ chat:chatId })
//       .populate([
//         {
//           path: "isReply.messageId",
//           select: "content file type",
//           populate: {
//             path: "sender",
//             select: "name image email lastActive createdAt onlineStatus",
//           },
//         },
//         {
//           path: "isReply.repliedBy",
//           select: "name image email lastActive createdAt onlineStatus",
//         },
//         {
//           path: "isEdit.messageId",
//           select: "content file type",
//           populate: {
//             path: "sender",
//             select: "name image email lastActive createdAt onlineStatus",
//           },
//         },
//         {
//           path: "isEdit.editedBy",
//           select: "name image email lastActive createdAt onlineStatus",
//         },
//       ])
//       .populate(
//         "sender removedBy unsentBy",
//         "name image email lastActive createdAt onlineStatus"
//       )
//       .populate("chat")
//       .sort({ _id: -1 })
//       .limit(limit)
//       .skip(skip);
//     // .sort({ _id: -1 }) // Use _id for sorting in descending order
//     messages = await User.populate(messages, {
//       path: "sender chat.users",
//       select: "name image email lastActive createdAt onlineStatus",
//     });
//     // Populate reactions for each message
//     messages = await Promise.all(
//       messages.map(async (message: any) => {
//         const { reactionsGroup, totalReactions } = await countReactionsGroupForMessage(
//           message._id
//         );
//         const reactions = await Reaction.find({ messageId: message._id })
//           .populate({
//             path: "reactBy",
//             select: "name image email lastActive createdAt onlineStatus",
//             options: { limit: 10 },
//           })
//           .sort({ updatedAt: -1 })
//           .exec();
//         //seenBy
//         const seenBy = await MessageSeenBy.find({ messageId: message._id })
//           .populate({
//             path: "userId",
//             select: "name image email lastActive createdAt onlineStatus",
//             options: { limit: 10 },
//           })
//           .sort({ updatedAt: -1 })
//           .exec();
//         //total seen by
//         const totalseenBy = await MessageSeenBy.countDocuments({
//           messageId: message._id,
//         });
//         return {
//           ...message.toObject(),
//           reactions,
//           reactionsGroup,
//           totalReactions,
//           seenBy: seenBy,
//           totalseenBy,
//         };
//       })
//     );
//     //find reactions here and pass with every message
//     //@
//      const total = await Message.countDocuments({ chat: chatId });
//       return { messages, total, limit, page, skip };
//   } catch (error: any) {
//     console.log({ error });
//   }
// };
