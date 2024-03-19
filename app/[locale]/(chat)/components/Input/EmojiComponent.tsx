const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false }
);
import { useMediaQuery } from "@uidotdev/usehooks";
import { Theme, EmojiStyle, SuggestionMode, Emoji } from "emoji-picker-react";import dynamic from "next/dynamic";


const EmojiComponent = ({ onEmojiClick, openEmoji }: { onEmojiClick: any; openEmoji:any }) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <div className="">
      {" "}
      <EmojiPicker
        open={openEmoji}
        style={{
          position: "absolute",
          top: isSmallDevice ? "-320px" : "-350px", // Adjust this value based on your design
          left: "0",
          zIndex: 1000,
          height: isSmallDevice ? "320px" : "340px",
          width: isSmallDevice ? "290px" : "310px",
          fontSize: "10px",
        }}
        onEmojiClick={onEmojiClick}
        autoFocusSearch
        theme={Theme.DARK}
        lazyLoadEmojis
        // previewConfig={{defaultEmoji:<Emoji/>}}

        emojiStyle={EmojiStyle.FACEBOOK}
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
    </div>
  );
};

export default EmojiComponent