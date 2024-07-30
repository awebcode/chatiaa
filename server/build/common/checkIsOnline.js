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
exports.getSocketConnectedUser = exports.checkOnlineUsers = exports.checkIfAnyUserIsOnline = void 0;
const mongoose_1 = require("mongoose");
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
// Keep track of connected sockets
// Function to add or update a user in the online users model
const checkOnlineUsers = (userId, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the user already exists in the online users model
        yield UserModel_1.User.findByIdAndUpdate(userId, { onlineStatus: "online", socketId }, { new: true });
    }
    catch (error) {
        if (error.code === 11000) {
            return null;
        }
        else {
            console.error("Error checking online users:", error);
        }
    }
});
exports.checkOnlineUsers = checkOnlineUsers;
// Function to get the socket connected user from the User model
const getSocketConnectedUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if id is a valid ObjectId
        const isObjectId = mongoose_1.Types.ObjectId.isValid(id);
        // Construct the query based on whether id is a valid ObjectId or not
        const query = isObjectId
            ? {
                $and: [{ onlineStatus: { $in: ["online", "busy"] } }, { _id: id }],
            }
            : {
                $and: [{ onlineStatus: { $in: ["online", "busy"] } }, { socketId: id }],
            };
        // Query the User model to find the user based on the constructed query
        const user = yield UserModel_1.User.findOne(query);
        if (user) {
            return {
                userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                socketId: user === null || user === void 0 ? void 0 : user.socketId,
            };
        }
    }
    catch (error) {
        console.error("Error finding socket connected user:", error);
        return null;
    }
});
exports.getSocketConnectedUser = getSocketConnectedUser;
