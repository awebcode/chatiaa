"use client"
const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false }
);
import { Theme, EmojiStyle, SuggestionMode, Emoji } from "emoji-picker-react";import dynamic from "next/dynamic";


const EmojiComponent = ({ onEmojiClick, openEmoji }: { onEmojiClick: any; openEmoji:any }) => {
  return (
    <div className="">
      {" "}
      <EmojiPicker
        open={openEmoji}
        style={{
          position: "absolute",
          top:  "-350px", // Adjust this value based on your design
          left: "0",
          zIndex: 1000,
          height: "340px",
          width:  "310px",
          fontSize: "10px",
        }}
        onEmojiClick={onEmojiClick}
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
    </div>
  );
};

export default EmojiComponent