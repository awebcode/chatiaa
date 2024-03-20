import { AiOutlineAudio } from "react-icons/ai";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { CiImageOn } from "react-icons/ci";
import { PiFilePdf } from "react-icons/pi";
import { IMessage } from "@/context/reducers/interfaces";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Tuser } from "@/store/types";
export default function PreviewEdReply({
  isEdit,
  currentUser,
}: {
  isEdit: IMessage;
  currentUser: Tuser;
}) {
  const senderName =
    isEdit.sender._id === currentUser._id ? "Myself" : isEdit.sender.name;
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  let previewContent;
  switch (isEdit.type) {
    case "image":
      previewContent = (
        <>
          {senderName} image
          <CiImageOn className="text-blue-500 text-lg inline mx-[1px]" />
        </>
      );
      break;
    case "audio":
      previewContent = (
        <>
          {senderName} Audio
          <AiOutlineAudio className="text-blue-500 text-lg inline mx-[1px]" />
        </>
      );
      break;
    case "video":
      previewContent = (
        <>
          {senderName} video
          <MdOutlineOndemandVideo className="text-blue-500 text-lg inline mx-[1px]" />{" "}
        </>
      );
      break;
    case "application":
      previewContent = (
        <>
          {senderName} Pdf
          <PiFilePdf className="text-blue-500 text-lg inline mx-[1px]" />
        </>
      );
      break;
    case "text":
      previewContent = isSmallDevice ? (
        <>
          <span>{senderName}</span>
          <p className="text-[10px]  py-1">
            {isEdit.content.length <= 70
              ? isEdit.content
              : isEdit.content.slice(0, 70) + "..."}
          </p>
        </>
      ) : (
        <>
          {" "}
          <span>{senderName}</span>
          <p className="text-xs py-1">
            {isEdit.content.length <= 200
              ? isEdit.content
              : isEdit.content.slice(0, 250) + "..."}
          </p>
        </>
      );
      break;
    default:
      previewContent = <span>{senderName}</span>;
  }

  return <>{previewContent}</>;
}
