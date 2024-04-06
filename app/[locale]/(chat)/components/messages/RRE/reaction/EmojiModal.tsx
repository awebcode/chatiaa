const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false }
);
import { PopoverContent } from "@/components/ui/popover";
import { IMessage } from "@/context/reducers/interfaces";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Theme, EmojiStyle, SuggestionMode, Emoji } from "emoji-picker-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

const EmojiModal = ({
  onEmojiClick,
  openEmoji,
  setIsOpenReactModal,
  setIsOpenEmojiModal,
  message,
  isCurrentUserMessage,
}: {
  onEmojiClick: any;
  openEmoji: any;
  setIsOpenReactModal: any;
  setIsOpenEmojiModal: any;
  message: IMessage;
  isCurrentUserMessage: boolean;
}) => {
  const { theme } = useTheme();
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <PopoverContent
     
      className="bg-transparent border-none outline-none shadow-none"
    >
      <PopoverArrow
        fill={theme === "dark" ? "#1f2937" : "#e5e7eb"}
        height={12}
        width={12}
      />
      <EmojiPicker
        open={openEmoji}
        style={{
          zIndex: 1000,
          height: isSmallDevice ? "270px" : "310px",
          width: isSmallDevice ? "240px" : "310px",
          fontSize: "10px",
          overflow: "auto",
        }}
        onEmojiClick={(e) => {
          onEmojiClick(e, message._id);
          setIsOpenReactModal(false);
          setIsOpenEmojiModal(false);
        }}
        // autoFocusSearch
        theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
        lazyLoadEmojis
        // previewConfig={{defaultEmoji:<Emoji/>}}

        emojiStyle={EmojiStyle.APPLE}
        searchPlaceholder="Search chat emojis..."
        suggestedEmojisMode={SuggestionMode.RECENT}
      />
    </PopoverContent>
  );
};

export default EmojiModal;
