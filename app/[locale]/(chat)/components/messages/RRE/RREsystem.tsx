import React, { useState } from "react";
import { HiDotsVertical, HiOutlineEmojiHappy } from "react-icons/hi";
import { BsReply } from "react-icons/bs";

import useEditReplyStore from "@/store/useEditReply";
import { IMessage } from "@/context/reducers/interfaces";
import EditUnModal from "./unedremove/EditUnModal";
import ReactModal from "./reaction/ReactModal";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RREsystem = ({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) => {
  const { onReply, isReply} =
    useEditReplyStore();
  

  //emoji
  const [isOpenReactModal, setIsOpenReactModal] = useState(false);

  
  return (
    <div className="">
      <div
        className={`flex items-center gap-2 ${
          isCurrentUserMessage ? "" : "flex-row-reverse"
        }`}
      >
        {/* Reply */}
        <div className={`relative`}>
          <BsReply
            onClick={() => onReply(message)}
            className={`${isReply ? "text-blue-500" : ""}text-lg cursor-pointer`}
          />
        </div>
        {/* emoji */}
        <DropdownMenu >
          <DropdownMenuTrigger className="border-none outline-none">
            <HiOutlineEmojiHappy className="text-lg cursor-pointer" />
          </DropdownMenuTrigger>
          <ReactModal
            isCurrentUserMessage={isCurrentUserMessage}
            message={message}
            setIsOpenReactModal={setIsOpenReactModal}
          />
        </DropdownMenu>
        {/* EditRemoveUnsent */}
        <DropdownMenu>
          <div className="relative">
            <DropdownMenuTrigger className="border-none outline-none">
              {" "}
              <HiDotsVertical className="text-lg cursor-pointer relative" />
            </DropdownMenuTrigger>
            <EditUnModal message={message} />
          </div>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RREsystem;
