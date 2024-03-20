const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false }
);
import { IMessage } from "@/context/reducers/interfaces";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Theme, EmojiStyle, SuggestionMode, Emoji } from "emoji-picker-react";
import dynamic from "next/dynamic";

const EmojiModal = ({
  onEmojiClick,
  openEmoji,
  setIsOpenReactModal,
  setIsOpenEmojiModal,
  message,
}: {
  onEmojiClick: any;
  openEmoji: any;
  setIsOpenReactModal: any;
  setIsOpenEmojiModal: any;
  message: IMessage;
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <>
      {" "}
      <EmojiPicker
        open={openEmoji}
        className="emojiReactModal"
        style={{
          position: "absolute",
          top: "50%",
          left: isSmallDevice ? "10%" : "40%",

          // bottom:"0px",
          // top: isSmallDevice ? "-320px" : "-350px", // Adjust this value based on your design
          // right: "-100px",
          zIndex: 1000,
          height: isSmallDevice ? "288px" : "310px",
          width: isSmallDevice ? "250px" : "310px",
          fontSize: "10px",
          overflow: "auto",
        }}
        onEmojiClick={(e) => {
          onEmojiClick(e, message._id);
          setIsOpenReactModal(false);
          setIsOpenEmojiModal(false);
        }}
        autoFocusSearch
        theme={Theme.DARK}
        lazyLoadEmojis
        // previewConfig={{defaultEmoji:<Emoji/>}}

        emojiStyle={EmojiStyle.APPLE}
        searchPlaceholder="Search chat emojis..."
        suggestedEmojisMode={SuggestionMode.RECENT}
        customEmojis={[
          {
            names: ["Alice", "alice in wonderland"],
            imgUrl:
              "https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png",
            id: "alice",
          },
        ]}
      />
    </>
  );
};

export default EmojiModal;
