## Internal Code Documentation: `processChatsWithUnseenCount` 

**Table of Contents**

* [Introduction](#introduction)
* [Code Overview](#code-overview)
* [Usage](#usage)
* [Dependencies](#dependencies)
* [Return Value](#return-value)
* [Error Handling](#error-handling)

### Introduction 

This document provides a detailed explanation of the `processChatsWithUnseenCount` function, which is responsible for processing chat data and adding information about unseen messages, user online status, and seen-by information to each chat object.

### Code Overview

```javascript
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
```

**Function:** `processChatsWithUnseenCount`

**Purpose:** Processes an array of chat objects, enriching each with information about unseen messages, user online status, and seen-by information.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `chats` | Array | An array of chat objects. |
| `unseenCount` | Array | An array of objects containing unseen message counts for each chat. |
| `userId` | String | The ID of the current user. |

**Steps:**

1. **Iterate over chats:** The function maps over the `chats` array, processing each chat individually.
2. **Find corresponding unseen count:** For each chat, it finds the corresponding unseen count object from the `unseenCount` array using the chat ID.
3. **Check online status:** It calls the `checkIfAnyUserIsOnline` function to determine if any user in the chat is currently online.
4. **Get seen-by information:**  It calls the `getSeenByInfo` function to retrieve information about who has seen the latest message in the chat.
5. **Get initial messages:**  It retrieves initial messages for the chat using the `allInitMessages` function.
6. **Construct enriched chat object:** It constructs a new chat object by combining the original chat data with the obtained information about unseen messages, online status, and seen-by information. 
7. **Handle errors:** The function handles potential errors gracefully by logging the error to the console and returning `null` for the affected chat. 
8. **Return enriched chats:** It returns a Promise that resolves to an array of enriched chat objects.

### Usage

```javascript
const chats = [
    // ... chat objects ... 
];

const unseenCount = [
    // ... unseen count objects ... 
];

const userId = "someUserId";

processChatsWithUnseenCount(chats, unseenCount, userId)
    .then((processedChats) => {
        // Use the processed chats
        console.log(processedChats);
    })
    .catch((error) => {
        console.error("Error processing chats:", error);
    });
```

### Dependencies

* `checkIsOnline_1`: A function to check if any user in a chat is currently online.
* `getInitMessages_1`: A function to fetch initial messages for a given chat.
* `seenByInfo_1`: A function to retrieve information about who has seen the latest message in a chat.

### Return Value

The function returns a Promise that resolves to an array of enriched chat objects. Each object in the array contains the original chat data along with:

* **`isOnline`**: A boolean value indicating whether any user in the chat is currently online.
* **`unseenCount`**: The number of unseen messages for the chat.
* **`latestMessage.seenBy`**:  An array containing the IDs of users who have seen the latest message.
* **`latestMessage.isSeen`**: A boolean value indicating whether the current user has seen the latest message.
* **`latestMessage.totalseenBy`**: The total number of users who have seen the latest message.
* **`messages`**: An array of messages associated with the chat.

### Error Handling

The function handles errors by logging them to the console and returning `null` for the affected chat object. This allows the function to continue processing other chat objects in the array.

**Example Error Log:**

```
Error: Error fetching seen-by information for chatId: 5f4d55334a542a76352a231f
``` 
