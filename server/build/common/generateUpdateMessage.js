"use strict";
// updateMessageGenerator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUpdateMessage = void 0;
const generateUpdateMessage = (currentUser, description, groupName, filePath) => {
    let message = `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.name} `;
    if (groupName && description && filePath) {
        message += `updated group name to ${groupName}, description, and group photo`;
    }
    else if (groupName && description) {
        message += `updated group name to ${groupName} and description`;
    }
    else if (groupName && filePath) {
        message += `updated group name to ${groupName} and group photo`;
    }
    else if (description && filePath) {
        message += `updated group description and group photo`;
    }
    else if (groupName) {
        message += `updated group name to ${groupName}`;
    }
    else if (description) {
        message += `updated group description`;
    }
    else if (filePath) {
        message += `updated group photo`;
    }
    return message;
};
exports.generateUpdateMessage = generateUpdateMessage;
