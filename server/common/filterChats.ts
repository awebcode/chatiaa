import { checkIfAnyUserIsOnline } from "./checkIsOnline";
import { allInitMessages } from "./getInitMessages";
import { getSeenByInfo } from "./seenByInfo";

export async function processChatsWithUnseenCount(chats:any, unseenCount:any, userId:any) {
  const chatPromises = chats.map(async (chat:any) => {
    const correspondingUnseenCount = unseenCount.find(
      (count:any) => count._id.toString() === chat._id.toString()
    );

    const isAnyUserOnline = await checkIfAnyUserIsOnline(chat?.users, userId);

    try {
      const { seenBy, isLatestMessageSeen, totalSeenCount } = await getSeenByInfo(
        chat._id,
        chat?.latestMessage?._id,
        userId
      );
      const messages = await allInitMessages(chat._id);

      return {
        ...chat.toObject(),
        latestMessage: {
          ...chat.latestMessage?._doc,
          isSeen: !!isLatestMessageSeen,
          seenBy,
          totalseenBy: totalSeenCount || 0,
        },
        messages,
        isOnline: isAnyUserOnline,
        unseenCount: correspondingUnseenCount
          ? correspondingUnseenCount.unseenMessagesCount
          : 0,
      };
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  });

  return Promise.all(chatPromises);
}
