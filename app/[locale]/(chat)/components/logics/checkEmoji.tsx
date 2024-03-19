import { Emoji, EmojiStyle } from "emoji-picker-react";
import emojiRegex from "emoji-regex";
import React, { useRef, useState } from "react";

export const RenderMessageWithEmojis = (input: string, isSmallDevice: boolean) => {
  const regex = emojiRegex();

  const handleCopyCapture = () => {
    // Allow the default copy behavior to proceed
    console.log("copied");

    navigator.clipboard.writeText(input);
  };

  const parts = [];

  let index = 0;

  for (const match of input.matchAll(regex)) {
    const emoji = match[0];

    // Add the text before the emoji, if any
    if (index < (match as any).index) {
      parts.push(<span key={index}>{input.substring(index, (match as any).index)}</span>);
    }

    // Render the emoji
    parts.push(
      <div className="inline-block mt-2">
        <span>
          <Emoji
            size={isSmallDevice ? 12 : 13}
            lazyLoad
            emojiStyle={EmojiStyle.FACEBOOK}
            unified={getUnifiedCodePoint(emoji)}
          />
        </span>
      </div>
    );

    index = (match as any).index + match[0].length;
  }

  // Add the remaining text after emojis, if any
  if (index < input.length) {
    parts.push(<span key={index}>{input.substring(index)}</span>);
  }

  return <span onCopyCapture={handleCopyCapture}>{parts}</span>;
};

// Example function to get the unified code point of an emoji
const getUnifiedCodePoint = (emoji: string) => {
  return (emoji as any).codePointAt(0).toString(16);
};
