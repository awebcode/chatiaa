import Image from "next/image";
import { IoIosCheckmarkCircle, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useMessageState } from "@/context/MessageContext";
import { IChat, IMessage } from "@/context/reducers/interfaces";
import { RxTimer } from "react-icons/rx";
import { BiLoaderCircle } from "react-icons/bi";
export const RenderStatus = (
  chat: IChat,
  message: IMessage,
  type: any,
  unseenCount: any,
  isLastSeenMessage: any
) => {
  const { selectedChat, user: currentUser } = useMessageState();

  let statusDiv;
  switch (message?.status) {
    case "seen":
      message?.sender?._id === currentUser?._id && type === "onFriendListCard"
        ? (statusDiv = (
            <div className="h-4 w-4 md:h-4 md:w-4 relative mr-2 ">
              <Image
                height={15}
                width={15}
                className="rounded-full h-full w-full object-cover"
                alt={message.sender.name as any}
                src={message.sender.image as any}
              />
            </div>
          ))
        : (statusDiv =
            type === "onMessage"
              ? // <div className="h-4 w-4 md:h-4 md:w-4 relative m-[2px] mt-3">
                //   <Image
                //     height={15}
                //     width={15}
                //     className="rounded-full h-full w-full object-cover"
                //     alt={selectedChat?.userInfo?.name as any}
                //     src={selectedChat?.userInfo?.image as any}
                //   />
                // </div>
                ""
              : null);
      break;
    case "delivered":
      message.sender?._id !== currentUser?._id && type === "onFriendListCard"
        ? (statusDiv = (
            <div className="h-4 w-4 md:h-4 md:w-4 relative mr-2  rounded-full bg-sky-500 flex items-center justify-center">
              <span className="text-gray-900 absolute text-[10px]">
                {unseenCount > 0 ? (unseenCount > 99 ? "99+" : unseenCount) : ""}
              </span>
              {/* <IoIosCheckmarkCircle className="h-4 w-4 md:h-4 md:w-4 relative  text-sky-600" /> */}
            </div>
          ))
        : (statusDiv = (
            <div className="h-4 w-4 md:h-4 md:w-4 relative mr-2 ">
              <IoIosCheckmarkCircle className="h-full w-full relative text-gray-400" />
            </div>
          ));
      break;
    case "unseen":
      statusDiv = (
        <div className="h-4 w-4 md:h-4 md:w-4 relative  mr-2 ">
          <IoIosCheckmarkCircleOutline className="h-full w-full text-gray-400 rounded-full relative" />
        </div>
      );
      break;
    default:
      !message._id
        ? (statusDiv = (
            <div className="h-4 w-4 md:h-4 md:w-4 relative mr-2">
              <BiLoaderCircle className="animate-spin h-full w-full text-blue-600 rounded-full relative" />
            </div>
          ))
        : null;
      break;
  }

  return statusDiv;
};
