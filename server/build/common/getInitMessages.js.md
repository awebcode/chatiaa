## Internal Code Documentation: allInitMessages

### Table of Contents

* **[1. Introduction](#1-introduction)**
    * **[1.1. Purpose](#11-purpose)**
    * **[1.2. Usage](#12-usage)**
* **[2. Code Breakdown](#2-code-breakdown)**
    * **[2.1. Imports](#21-imports)**
    * **[2.2. Function Definition](#22-function-definition)**
        * **[2.2.1. Error Handling](#221-error-handling)**
        * **[2.2.2. Message Retrieval](#222-message-retrieval)**
        * **[2.2.3. Populate Reactions and SeenBy Data](#223-populate-reactions-and-seenby-data)**
        * **[2.2.4. Calculate Total Messages](#224-calculate-total-messages)**
        * **[2.2.5. Return Data](#225-return-data)**
* **[3. Example Usage](#3-example-usage)**

### 1. Introduction

#### 1.1. Purpose

The `allInitMessages` function is responsible for fetching initial messages for a given chat. It fetches a limited number of messages (12 by default) from the database, populates them with relevant data like reactions, seenBy users, and sender information, and returns the results along with pagination information.

#### 1.2. Usage

The function takes a single argument:

* `chatId`: The ID of the chat for which messages should be fetched.

The function returns an object containing:

* `messages`: An array of message objects, each with populated data.
* `total`: The total number of messages in the chat.
* `limit`: The number of messages fetched per page.
* `page`: The current page number (always 1 for initial fetch).
* `skip`: The number of messages to skip (always 0 for initial fetch).

### 2. Code Breakdown

#### 2.1. Imports

The function imports the following modules:

* `messageController`: Provides the `countReactionsGroupForMessage` function for calculating reaction group data.
* `MessageModel`: Provides the `Message` model for interacting with messages in the database.
* `reactModal`: Provides the `Reaction` model for interacting with reactions in the database.
* `seenByModel`: Provides the `MessageSeenBy` model for interacting with seenBy data in the database.

#### 2.2. Function Definition

```typescript
// @ allInitMessages         Protected
const allInitMessages = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    // ... code ... 
  } catch (error) {
    // ... code ...
  }
});
```

The function is defined as an asynchronous function using the `__awaiter` helper. This allows for asynchronous operations like database queries to be handled efficiently.

##### 2.2.1. Error Handling

The function uses a `try...catch` block to handle potential errors during execution. If an error occurs, it is logged to the console and a generic error message is thrown.

##### 2.2.2. Message Retrieval

```typescript
const limit = 12;
const page = 1;
const skip = 0;

// Fetch messages with necessary data only
let messages = yield MessageModel_1.Message.find({ chat: chatId })
  .populate([
    // ... populate options ...
  ])
  .sort({ _id: -1 })
  .limit(limit)
  .skip(skip);
```

The function first defines the pagination parameters: `limit`, `page`, and `skip`. Then, it retrieves messages from the database using the `Message` model's `find()` method.

The following populate options are used to fetch related data for each message:

* **`isReply.messageId`**: Populates the message object with the content, file type, and sender information of the message being replied to.
* **`isReply.repliedBy`**: Populates the message object with the sender information of the user who replied to the message.
* **`isEdit.messageId`**: Populates the message object with the content, file type, and sender information of the message being edited.
* **`isEdit.editedBy`**: Populates the message object with the sender information of the user who edited the message.
* **`sender`**: Populates the message object with the sender information.
* **`removedBy`**: Populates the message object with the information of the user who removed the message.
* **`unsentBy`**: Populates the message object with the information of the user who unsent the message.

The messages are sorted in descending order by `_id` (newest messages first) and limited to `limit` messages, skipping `skip` messages.

##### 2.2.3. Populate Reactions and SeenBy Data

```typescript
// Populate reactions and seenBy data for each message
messages = yield Promise.all(
  messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
    // ... code ...
  }))
);
```

The function iterates over each message in the retrieved array and populates it with reactions and seenBy data. This is done asynchronously using `Promise.all()` to improve performance.

For each message, the following steps are performed:

1. **Calculate reaction group data**: The `countReactionsGroupForMessage()` function is used to calculate the number of reactions for each reaction type (e.g., like, love, etc.).
2. **Fetch reactions and seenBy**: Reactions and seenBy data are fetched concurrently using `Promise.all()`.
    * **Reactions**: The `Reaction` model's `find()` method is used to fetch reactions for the message. The reactions are populated with the `reactBy` user information.
    * **SeenBy**: The `MessageSeenBy` model's `find()` method is used to fetch seenBy data for the message. The seenBy data is populated with the `userId` user information.
3. **Add data to message object**: The fetched reactions, seenBy data, and calculated reaction group data are added to the message object.
4. **Return updated message object**: The updated message object is returned.

##### 2.2.4. Calculate Total Messages

```typescript
// Count total number of messages for pagination
const total = yield MessageModel_1.Message.countDocuments({ chat: chatId });
```

The function retrieves the total number of messages in the chat using the `Message` model's `countDocuments()` method.

##### 2.2.5. Return Data

```typescript
return { messages, total, limit, page, skip };
```

The function returns an object containing the fetched messages, total messages, limit, page number, and skip count.

### 3. Example Usage

```typescript
// Get messages for chat with ID '12345'
const chatMessages = await allInitMessages('12345');

// Access the fetched messages
console.log(chatMessages.messages);

// Access the total number of messages
console.log(chatMessages.total);
```

This example demonstrates how to use the `allInitMessages` function to fetch initial messages for a chat and access the returned data.