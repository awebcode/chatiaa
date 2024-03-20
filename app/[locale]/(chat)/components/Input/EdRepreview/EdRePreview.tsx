import { useMessageState } from "@/context/MessageContext";
import useEditReplyStore from "@/store/useEditReply";
import dynamic from "next/dynamic";
import React, { Dispatch } from "react";
import { BsReply } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
const PreviewEdReply = dynamic(() => import("./Preview"));

const EdRePreview = ({ setMessage }: { setMessage: Dispatch<string> }) => {
  const { cancelEdit, cancelReply, isEdit, isReply } = useEditReplyStore();
  const { user: currentUser } = useMessageState();
  return (
    <div>
      {" "}
      {isEdit && (
        <div className="p-2 md:p-4  text-xs md:text-sm  rounded">
          <div className="flexBetween">
            <div>
              <FaEdit className="inline mx-1 text-blue-500" />  Editing to
              <span className="mx-2">
                <>
                  <PreviewEdReply currentUser={currentUser as any} isEdit={isEdit} />
                </>
              </span>
            </div>
            <IoMdClose
              onClick={() => {
                setMessage("");
                cancelEdit();
              }}
              className="h-4 w-4 md:h-6 md:w-6 cursor-pointer"
            />
          </div>
        </div>
      )}
      {isReply && (
        <div className="p-2 md:p-4  text-xs md:text-sm  m-y rounded">
          <div className="flexBetween">
            <div>
              {" "}
              <BsReply className="inline mx-1 text-blue-500" /> replying to{" "}
              <span className="font-bold mx-2">
                {isReply.sender._id === currentUser?._id ? "Myself" : isReply.sender.name}
              </span>
            </div>
            <IoMdClose
              onClick={() => cancelReply()}
              className="h-4 w-4 md:h-6 md:w-6 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EdRePreview;
