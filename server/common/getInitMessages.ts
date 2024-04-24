import { countReactionsGroupForMessage } from "../controllers/messageController";
import { Message } from "../model/MessageModel";
import { User } from "../model/UserModel";
import { Reaction } from "../model/reactModal";
import { MessageSeenBy } from "../model/seenByModel";

//@access          Protected
export const allInitMessages = async (
 chatId:string
) => {
  try {
    const limit =  12;
    const page = 1;
    // const skip = (page - 1) * limit;

    const skip =  0;
    let messages: any = await Message.find({ chat:chatId })
      .populate([
        {
          path: "isReply.messageId",
          select: "content file type",
          populate: {
            path: "sender",
            select: "name image email lastActive createdAt onlineStatus",
          },
        },
        {
          path: "isReply.repliedBy",
          select: "name image email lastActive createdAt onlineStatus",
        },
        {
          path: "isEdit.messageId",
          select: "content file type",
          populate: {
            path: "sender",
            select: "name image email lastActive createdAt onlineStatus",
          },
        },
        {
          path: "isEdit.editedBy",
          select: "name image email lastActive createdAt onlineStatus",
        },
      ])

      .populate(
        "sender removedBy unsentBy",
        "name image email lastActive createdAt onlineStatus"
      )
      .populate("chat")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    // .sort({ _id: -1 }) // Use _id for sorting in descending order

    messages = await User.populate(messages, {
      path: "sender chat.users",
      select: "name image email lastActive createdAt onlineStatus",
    });
    // Populate reactions for each message
    messages = await Promise.all(
      messages.map(async (message: any) => {
        const { reactionsGroup, totalReactions } = await countReactionsGroupForMessage(
          message._id
        );
        const reactions = await Reaction.find({ messageId: message._id })
          .populate({
            path: "reactBy",
            select: "name image email lastActive createdAt onlineStatus",
            options: { limit: 10 },
          })
          .sort({ updatedAt: -1 })
          .exec();
        //seenBy
        const seenBy = await MessageSeenBy.find({ messageId: message._id })
          .populate({
            path: "userId",
            select: "name image email lastActive createdAt onlineStatus",
            options: { limit: 10 },
          })
          .sort({ updatedAt: -1 })
          .exec();
        //total seen by
        const totalseenBy = await MessageSeenBy.countDocuments({
          messageId: message._id,
        });

        return {
          ...message.toObject(),
          reactions,
          reactionsGroup,
          totalReactions,
          seenBy: seenBy,
          totalseenBy,
        };
      })
    );
    //find reactions here and pass with every message
    //@
     const total = await Message.countDocuments({ chat: chatId });
      return { messages, total, limit, page, skip };
  } catch (error: any) {
    console.log({ error });
  }
};
