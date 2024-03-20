import React, { useState } from "react";
import { HiDotsVertical, HiOutlineEmojiHappy } from "react-icons/hi";
import { BsReply } from "react-icons/bs";
import { useClickAway } from "@uidotdev/usehooks";
import useEditReplyStore from "@/store/useEditReply";
import { IMessage } from "@/context/reducers/interfaces";
import EditUnModal from "./unedremove/EditUnModal";
import ReactModal from "./reaction/ReactModal";
const RREsystem = ({ message }: { message: IMessage }) => {
  const { onReply, onEdit, cancelReply, cancelEdit, isReply, isEdit } =
    useEditReplyStore();
  const [openEdRemoveDialog, setopenEdRemoveDialog] = useState(false);
  const clickOutsideEdRemoveDialog: any = useClickAway(() => {
    setopenEdRemoveDialog(false);
  });

  //emoji
  const [isOpenReactModal, setIsOpenReactModal] = useState(false);
 
  const clickOutsideReactModal: any = useClickAway(() => {
    setIsOpenReactModal(false);
  });
  return (
    <div className="">
      <div className="flex items-center gap-2">
        {/* EditRemoveUnsent */}
        <div className={`relative`} ref={clickOutsideEdRemoveDialog}>
          <HiDotsVertical
            onClick={() => {
              setopenEdRemoveDialog(!openEdRemoveDialog);
              console.log("click");
            }}
            className="text-lg cursor-pointer relative"
          />
          <EditUnModal message={message} openEdRemoveDialog={openEdRemoveDialog} />
        </div>
        {/* emoji */}
        <div className={`relative`} ref={clickOutsideReactModal}>
          <HiOutlineEmojiHappy
            onClick={() => setIsOpenReactModal(!isOpenReactModal)}
            className="text-lg cursor-pointer relative"
          />
          <ReactModal
            message={message}
            isOpenReactModal={isOpenReactModal}
            setIsOpenReactModal={setIsOpenReactModal}
          />
        </div>
        {/* Reply */}
        <div className={`relative`}>
          <BsReply
            onClick={() => onReply(message)}
            className={`${isReply ? "text-blue-500" : ""}text-lg cursor-pointer`}
          />
        </div>
      </div>
    </div>
  );
};

export default RREsystem;
