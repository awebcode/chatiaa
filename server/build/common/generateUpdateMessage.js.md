## updateMessageGenerator.ts

### Table of Contents 

* [Generate Update Message Function](#generate-update-message-function)

### Generate Update Message Function

This function generates a message indicating what was updated in a group based on the provided parameters.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| currentUser | Object | The user who made the update. |
| description | String | The new group description. |
| groupName | String | The new group name. |
| filePath | String | The path to the new group photo. |

**Returns:**

* A string containing the update message.

**Example Usage:**

```typescript
const currentUser = { name: "John Doe" };
const groupName = "New Group Name";
const description = "This is a new description.";
const filePath = "path/to/new/photo.jpg";

const updateMessage = generateUpdateMessage(currentUser, description, groupName, filePath);

console.log(updateMessage); // Output: "John Doe updated group name to New Group Name, description, and group photo"
```

**Code:**

```typescript
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
```

**Logic:**

The function constructs the message based on which parameters are provided. It handles different combinations of updates, creating a specific message for each scenario. For example:

* If only `groupName` is provided, the message will indicate that only the group name was updated.
* If `groupName`, `description`, and `filePath` are all provided, the message will indicate that the group name, description, and photo were all updated.

**Notes:**

* The `currentUser` parameter is optional. If it is not provided, the message will not include the user's name.
* The function assumes that the `currentUser` object has a `name` property.
