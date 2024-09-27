## Code Documentation: Event Emitter for Chat Application

This code provides functions for emitting events to online users within a chat application.  It leverages Socket.IO for real-time communication. 

### Table of Contents 
* [1. Overview](#1-overview)
* [2. Functions](#2-functions)
    * [2.1 `emitEventToGroupUsers`](#21-emiteventtogroupusers)
    * [2.2 `markMessageAsDeliverdAfteronlineFriend`](#22-markmessageaseliverdafteronlinefriend)
    * [2.3 `emitEventToOnlineUsers`](#23-emiteventtoonlineusers)

### 1. Overview

This code defines three functions:
* **`emitEventToGroupUsers`:** Emits an event to all users within a specific chat. 
* **`markMessageAsDeliverdAfteronlineFriend`:** Marks messages as delivered when a user comes online after being offline.
* **`emitEventToOnlineUsers`:** Emits an event to all online users associated with a specific user's chats.

### 2. Functions 

#### 2.1 `emitEventToGroupUsers`

This function emits an event to all users within a specific chat.  It uses Socket.IO's `to` method to target the specific chat room. 

**Parameters:**
* `io`: The Socket.IO server instance. 
* `event`: The name of the event to be emitted.
* `chatId`: The ID of the chat to target.
* `data`: The data to be sent with the event.

**Functionality:**

1. Retrieves the users associated with the specified chat ID from the database.
2. Iterates through the users and checks if each user is online using the `getSocketConnectedUser` helper function.
3. If the user is online, the function retrieves the user's socket ID. 
4. The event is emitted to the user's socket ID using `io.to(socketId).emit`. 
5. The data passed to the event includes the original data and the receiver's user ID.

**Example Usage:**
```javascript
// Emit "remove_remove_All_unsentMessage" event to all users in the chat with ID 'message.chatId'
emitEventToChatUsers(io, "remove_remove_All_unsentMessage", message.chatId, message); 
```

#### 2.2 `markMessageAsDeliverdAfteronlineFriend`

This function marks messages as delivered when a user comes online after being offline. 

**Parameters:**
* `io`: The Socket.IO server instance. 
* `userId`: The ID of the user who came online. 

**Functionality:**

1. Retrieves all chats associated with the user.
2. Iterates through each chat and checks if it has a latest message.
3. If a latest message exists, it checks if the message status is "unseen" and the sender is not the user who just came online.
4. If these conditions are met, the function retrieves the sender's socket ID using `getSocketConnectedUser`.
5. It then emits the "receiveDeliveredAllMessageAfterReconnect" event to the sender's socket ID, providing the chat ID.

**Example Usage:**
```javascript
// Mark messages as delivered for user with ID 'userId' after they come online
markMessageAsDeliverdAfteronlineFriend(io, userId); 
```

#### 2.3 `emitEventToOnlineUsers`

This function emits an event to all online users associated with a specific user's chats.

**Parameters:**
* `io`: The Socket.IO server instance. 
* `eventName`: The name of the event to be emitted.
* `userId`: The ID of the user whose chats will be targeted.
* `eventData`: The data to be sent with the event.

**Functionality:**

1. Retrieves the user's information from the database.
2. Updates the user's online status to "offline" if the event name is "leaveOnlineUsers".
3. Retrieves all chats associated with the user.
4. Iterates through the chats and checks if any users within the chat are online.
5. If any user is online, the function retrieves their socket ID and emits the event to their socket ID.
6. The data passed to the event includes the original data, chat ID, flag indicating if any other user is online in the group, and the user's information.

**Example Usage:**
```javascript
// Emit "leaveOnlineUsers" event to online users in the user's chats, indicating the user is offline
emitEventToOnlineUsers(io, "leaveOnlineUsers", userId, {}); 
``` 
