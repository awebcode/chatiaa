import { checkIfAnyUserIsOnline } from "./checkIsOnline";
import { allInitMessages } from "./getInitMessages";
import { getSeenByInfo } from "./seenByInfo";
export async function processChatsWithUnseenCount(
  chats: any,
  unseenCount: any,
  userId: any
) {
  try {
    const chatPromises = chats.map(async (chat:any) => {
      // Find the corresponding unseen count for the chat
      const correspondingUnseenCount = unseenCount.find(
        (count:any) => count._id.toString() === chat._id.toString()
      );

      // Check if any user is online in the chat
      const isAnyUserOnline = await checkIfAnyUserIsOnline(chat?.users, userId);

      // Fetch seenBy info and initial messages in parallel
      const [seenByInfo, messages] = await Promise.all([
        getSeenByInfo(chat._id, chat?.latestMessage?._id, userId),
        allInitMessages(chat._id),
      ]);

      const { seenBy, isLatestMessageSeen, totalSeenCount } = seenByInfo;

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
    });

    // Wait for all chat data to be processed
    return Promise.all(chatPromises);
  } catch (error) {
    console.error("Error processing chats with unseen count:", error);
    throw new Error("Failed to process chats");
  }
}
// export async function processChatsWithUnseenCount(chats:any, unseenCount:any, userId:any) {
//   const chatPromises = chats.map(async (chat:any) => {
//     const correspondingUnseenCount = unseenCount.find(
//       (count:any) => count._id.toString() === chat._id.toString()
//     );

//     const isAnyUserOnline = await checkIfAnyUserIsOnline(chat?.users, userId);

//     try {
//       const { seenBy, isLatestMessageSeen, totalSeenCount } = await getSeenByInfo(
//         chat._id,
//         chat?.latestMessage?._id,
//         userId
//       );
//       const messages = await allInitMessages(chat._id);

//       return {
//         ...chat.toObject(),
//         latestMessage: {
//           ...chat.latestMessage?._doc,
//           isSeen: !!isLatestMessageSeen,
//           seenBy,
//           totalseenBy: totalSeenCount || 0,
//         },
//         messages,
//         isOnline: isAnyUserOnline,
//         unseenCount: correspondingUnseenCount
//           ? correspondingUnseenCount.unseenMessagesCount
//           : 0,
//       };
//     } catch (error) {
//       console.error("Error:", error);
//       return null;
//     }
//   });

//   return Promise.all(chatPromises);
// }
