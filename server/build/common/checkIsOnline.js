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
exports.checkIfAnyUserIsOnline = void 0;
const UserModel_1 = require("../model/UserModel");
function checkIfAnyUserIsOnline(chatUsers, reqId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userIds = (chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.map((user) => { var _a; return (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(); })) || [];
        // Query onlineUsersModel for online status of filtered users
        const onlineUsers = yield UserModel_1.User.find({
            _id: { $in: userIds, $ne: reqId },
            onlineStatus: { $in: ["online", "busy"] },
        });
        // Map the online status to userIds
        const onlineUserIds = onlineUsers.map((user) => { var _a; return (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(); });
        const isOnline = chatUsers === null || chatUsers === void 0 ? void 0 : chatUsers.some((user) => {
            return onlineUserIds.includes(user === null || user === void 0 ? void 0 : user._id.toString()) && (user === null || user === void 0 ? void 0 : user._id.toString()) !== reqId;
        });
        return !!isOnline;
    });
}
exports.checkIfAnyUserIsOnline = checkIfAnyUserIsOnline;
