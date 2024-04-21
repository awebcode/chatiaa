import { Emoji, EmojiStyle } from "emoji-picker-react";
import emojiRegex from "emoji-regex";
import React, { useRef, useState } from "react";

export const RenderMessageWithEmojis = (
  input: string,
  isSmallDevice: boolean,
  handleInput?: (e: string) => void
) => {
  const regex = emojiRegex();

  const handleCopyCapture = () => {
    // Allow the default copy behavior to proceed

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
      <div className="inline-block">
        <span>
          <Emoji
            size={isSmallDevice ? 12 : 14}
            lazyLoad
            emojiStyle={EmojiStyle.APPLE}
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
  return (
    <span className="" onCopyCapture={handleCopyCapture}>
      {parts}
    </span>
  );
};

// Example function to get the unified code point of an emoji
const getUnifiedCodePoint = (emoji: string) => {
  return (emoji as any).codePointAt(0).toString(16);
};
