##  Process Chats with Unseen Count 
###  Table of Contents
* [Description](#description)
* [Parameters](#parameters)
* [Return Value](#return-value)
* [Example Usage](#example-usage)
* [Implementation Details](#implementation-details)

### Description
This function processes an array of chat objects and enhances them with information about unseen messages, online status, and seen-by details. 

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `chats` | Array | An array of chat objects. Each chat object is expected to have an `_id` property. |
| `unseenCount` | Array | An array of unseen count objects. Each unseen count object is expected to have an `_id` and `unseenMessagesCount` property.  |
| `userId` | String | The ID of the current user. |

### Return Value
This function returns a Promise that resolves to an array of enhanced chat objects. Each enhanced chat object includes the following additional properties:

| Property | Type | Description |
|---|---|---|
| `messages` | Array | Array of initial messages associated with the chat. |
| `isOnline` | Boolean | Indicates if any user in the chat is currently online. |
| `unseenCount` | Number | The number of unseen messages in the chat. |
| `latestMessage.isSeen` | Boolean | Indicates if the latest message in the chat has been seen by the current user. |
| `latestMessage.seenBy` | Array | An array of user IDs who have seen the latest message. |
| `latestMessage.totalseenBy` | Number | Total number of users who have seen the latest message. |

### Example Usage
```javascript
const chats = [
    // Chat objects
];
const unseenCount = [
    // Unseen count objects
];
const userId = 'user123';

processChatsWithUnseenCount(chats, unseenCount, userId)
    .then(enhancedChats => {
        console.log(enhancedChats);
    })
    .catch(error => {
        console.error(error);
    });
```

### Implementation Details

1. **Iterate through chats:** The function iterates through each chat in the provided `chats` array.
2. **Find unseen count:** For each chat, it searches the `unseenCount` array for the corresponding unseen count object based on the chat's ID. 
3. **Check online status:** It utilizes the `checkIfAnyUserIsOnline` function (from the `checkIsOnline` module) to determine if any user in the chat is currently online.
4. **Fetch seen-by and initial messages:** It fetches the seen-by information (using the `getSeenByInfo` function from the `seenByInfo` module) and initial messages (using the `allInitMessages` function from the `getInitMessages` module) for each chat in parallel using `Promise.all`.
5. **Enrich chat object:**  The function enhances each chat object with the following properties:
    - `messages`: The fetched initial messages.
    - `isOnline`: The online status of the chat.
    - `unseenCount`: The number of unseen messages in the chat.
    - `latestMessage.isSeen`: Indicates if the latest message has been seen.
    - `latestMessage.seenBy`:  An array of user IDs who have seen the latest message. 
    - `latestMessage.totalseenBy`:  The total number of users who have seen the latest message.
6. **Return enhanced chats:** Once all chat objects are processed, the function returns a Promise that resolves to an array of the enhanced chat objects.

**Error Handling:** The function includes error handling to gracefully manage potential errors during processing. If any error occurs, it logs the error to the console and throws a new error indicating failure to process chats. 

**Async/Await:** The function utilizes async/await to simplify asynchronous operations, improving code readability and maintainability. 
