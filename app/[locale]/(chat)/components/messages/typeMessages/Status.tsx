import { useMessageState } from '@/context/MessageContext';
import { IMessage } from '@/context/reducers/interfaces';
import React from 'react'
import { RenderStatus } from '../../logics/RenderStatusComponent';
import Image from 'next/image';

const Status = ({
  message,
  isLastSeenMessage,
  isUserOnline,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
}) => {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
  return (
    <div className={"absolute bottom-1 -right-8 flex items-end gap-1"}>
      {message?.sender?._id === currentUser?._id ? (
        // Assuming RenderStatus is a function
        RenderStatus(message, "onMessage", 0, currentUser, isLastSeenMessage)
      ) : (
        <div className="h-8 w-8 relative">
          {/* Assuming Image is a component */}
          <Image
            height={35}
            width={35}
            className="rounded-full h-full w-full object-cover"
            alt={message?.sender?.name}
            src={message?.sender?.image}
          />
          )
          <span
            className={`absolute bottom-0 right-0 rounded-full p-[4px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
      )}
    </div>
  );
};

export default Status