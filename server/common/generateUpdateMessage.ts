// updateMessageGenerator.ts

interface User {
  name: string;
}

export const generateUpdateMessage = (
  currentUser: User,
  description?: string,
  groupName?: string,

  filePath?: string
): string => {
  let message = `${currentUser?.name} `;

  if (groupName && description && filePath) {
    message += `updated group name to ${groupName}, description, and group photo`;
  } else if (groupName && description) {
    message += `updated group name to ${groupName} and description`;
  } else if (groupName && filePath) {
    message += `updated group name to ${groupName} and group photo`;
  } else if (description && filePath) {
    message += `updated group description and group photo`;
  } else if (groupName) {
    message += `updated group name to ${groupName}`;
  } else if (description) {
    message += `updated group description`;
  } else if (filePath) {
    message += `updated group photo`;
  }

  return message;
};
