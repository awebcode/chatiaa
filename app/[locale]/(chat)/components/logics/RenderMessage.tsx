import { useMessageState } from "@/context/MessageContext";

export const GetReplyText = (message: any) => {
  const { selectedChat, user: currentUser } = useMessageState();
  const isCurrentUserSender = message.sender._id === currentUser?._id;
  const isReplyingToSelf = message.sender._id === message.isReply?.messageId?.sender?._id;

  if (isReplyingToSelf) {
    return isCurrentUserSender ? "You replied to yourself" : "";
  }

  return isCurrentUserSender
    ? ` ${selectedChat?.userInfo?.name} replied to you `
    : `You replied to ${selectedChat?.userInfo?.name}`;
};

export const RenderMessageContent = (message: any, content: any, currentUser: any) => (
  <div className="relative text-sm bg-gray-800 rounded-lg p-3 max-w-[260px] break-words !h-fit">
    <span className="text-gray-300">{content}</span>
    {message.status !== "remove" &&
      message.status !== "reBack" &&
      message.removedBy?._id !== currentUser?._id && (
        <div className="absolute -bottom-7 ring-2 ring-gray-400 left-8 right-0 text-sm text-gray-200 bg-gray-800 rounded-lg p-2 max-w-[260px] break-words !h-fit">
          {content}
        </div>
      )}
  </div>
);
