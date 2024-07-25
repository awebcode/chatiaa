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
exports.processChatsWithUnseenCount = void 0;
const checkIsOnline_1 = require("./checkIsOnline");
const getInitMessages_1 = require("./getInitMessages");
const seenByInfo_1 = require("./seenByInfo");
function processChatsWithUnseenCount(chats, unseenCount, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatPromises = chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const correspondingUnseenCount = unseenCount.find((count) => count._id.toString() === chat._id.toString());
            const isAnyUserOnline = yield (0, checkIsOnline_1.checkIfAnyUserIsOnline)(chat === null || chat === void 0 ? void 0 : chat.users, userId);
            try {
                const { seenBy, isLatestMessageSeen, totalSeenCount } = yield (0, seenByInfo_1.getSeenByInfo)(chat._id, (_a = chat === null || chat === void 0 ? void 0 : chat.latestMessage) === null || _a === void 0 ? void 0 : _a._id, userId);
                const messages = yield (0, getInitMessages_1.allInitMessages)(chat._id);
                return Object.assign(Object.assign({}, chat.toObject()), { latestMessage: Object.assign(Object.assign({}, (_b = chat.latestMessage) === null || _b === void 0 ? void 0 : _b._doc), { isSeen: !!isLatestMessageSeen, seenBy, totalseenBy: totalSeenCount || 0 }), messages, isOnline: isAnyUserOnline, unseenCount: correspondingUnseenCount
                        ? correspondingUnseenCount.unseenMessagesCount
                        : 0 });
            }
            catch (error) {
                console.error("Error:", error);
                return null;
            }
        }));
        return Promise.all(chatPromises);
    });
}
exports.processChatsWithUnseenCount = processChatsWithUnseenCount;
