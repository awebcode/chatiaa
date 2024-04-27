import { IMessage } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";

export const isSameSenderMargin = (
  messages: any[],
  m: any,
  i: number,
  userId: string
): number | "auto" => {
  if (
    i < messages.length - 1 &&
    messages[i + 1]?.sender?._id === m.sender?._id &&
    messages[i]?.sender?._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1]?.sender?._id !== m.sender?._id &&
      messages[i]?.sender?._id !== userId) ||
    (i === messages.length - 1 && messages[i]?.sender?._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (
  messages: any[],
  m: any,
  i: number,
  userId: string
): boolean => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1]?.sender?._id !== m.sender?._id ||
      messages[i + 1]?.sender?._id === undefined) &&
    messages[i]?.sender?._id !== userId
  );
};

export const isLastMessage = (messages: any[], i: number, userId: string): boolean => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1]?.sender?._id !== userId &&
    messages[messages.length - 1]?.sender?._id !== undefined
  );
};

export const isSameUser = (messages: any[], m: any, i: number): boolean => {
  return i > 0 && messages[i - 1]?.sender?._id === m.sender?._id;
};

export const getSender = (loggedUser: Tuser | any, users: Tuser[]): string => {
  return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name || "";
};

export const getSenderFull = (loggedUser: Tuser | any, users: Tuser[]): Tuser | any => {
  if (!loggedUser || !users) {
    return;
  }
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};

//find last seen message

export function findLastSeenMessageIndex(messages: any) {
  for (let i = messages?.length - 1; i >= 0; i--) {
    if (messages[i]?.status === "seen") {
      return i;
    }
  }
  return -1; // No seen messages found
}

// Function to filter out duplicate tempMessageId values
export const filterDuplicateTempMessageIds = (
  messages: IMessage[],
  shouldClearSet?: boolean,
  removeCallback?: (uniqueIds: Set<string>) => void
): IMessage[] => {
  const uniqueIds = new Set<string>(); // Use a Set to store unique tempMessageIds
  const uniqueMessages: IMessage[] = []; // Array to store messages with unique tempMessageIds

  // Iterate through each message
  for (const message of messages) {
    // Check if the tempMessageId is not in the uniqueIds Set
    if (!uniqueIds.has(message?.tempMessageId || '') && !uniqueIds.has(message?._id || '')) {
      // If not, add it to the Set and push the message to the uniqueMessages array
      uniqueIds.add(message?.tempMessageId || message?._id || '');
      uniqueMessages.push(message);
    }
  }

  // If shouldClearSet is true and a remove callback function is provided, execute it
  if (shouldClearSet && removeCallback) {
    removeCallback(uniqueIds);
  }

  return uniqueMessages;
};