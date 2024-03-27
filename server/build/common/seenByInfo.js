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
exports.getSeenByInfo = void 0;
const seenByModel_1 = require("../model/seenByModel");
const getSeenByInfo = (chatId, latestMessageId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const seenBy = yield seenByModel_1.MessageSeenBy.find({ messageId: latestMessageId })
        .populate({
        path: "userId",
        select: "name image email",
        options: { limit: 5 },
    })
        .sort({ updatedAt: -1 })
        .exec();
    const isLatestMessageSeen = latestMessageId
        ? yield seenByModel_1.MessageSeenBy.exists({
            chatId,
            messageId: latestMessageId,
            userId,
        })
        : null;
    const totalSeenByCount = yield seenByModel_1.MessageSeenBy.countDocuments({
        messageId: latestMessageId,
    });
    return {
        seenBy,
        isLatestMessageSeen,
        totalseenBy: totalSeenByCount,
    };
});
exports.getSeenByInfo = getSeenByInfo;
