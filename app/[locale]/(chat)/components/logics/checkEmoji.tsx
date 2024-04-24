import { Emoji, EmojiStyle } from "emoji-picker-react";
import emojiRegex from "emoji-regex";
import React, { useRef, useState } from "react";

export const RenderMessageWithEmojis = (
  input: string,
  isSmallDevice: boolean,
  onChatCard: boolean,
  handleInput?: (e: string) => void
) => {
  const regex = emojiRegex();

  const handleCopyCapture = () => {
    // Allow the default copy behavior to proceed

    navigator.clipboard.writeText(input);
  };

  const parts = [];
  const largeEmojis = [];
  let index = 0;

  for (const match of input.matchAll(regex)) {
    const emoji = match[0];
   

    if (index < (match as any).index) {
      // Add the text before the emoji, if any
      parts.push(
        <span key={index + Math.random() * 500 + Date.now()}>
          {input.substring(index, (match as any).index)}
        </span>
      );
    }

    // Render the emoji
    parts.push(
      <div className="inline-block">
        <span>
          <Emoji
            size={isSmallDevice ? 12 : 14}
            lazyLoad
            emojiStyle={EmojiStyle.FACEBOOK}
            unified={getUnifiedCodePoint(emoji)}
          />
        </span>
      </div>
    );
    // Check if input length is less than 15 and all characters are emojis then show thier size as big
    if (input.length < 15  && !onChatCard && !extractTextWithoutEmoji(input)) {
      largeEmojis.push(
        <div className="inline-block">
          <span>
            <Emoji
              size={isSmallDevice ? 32 : 44}
              lazyLoad
              emojiStyle={EmojiStyle.FACEBOOK}
              unified={getUnifiedCodePoint(emoji)}
            />
          </span>
        </div>
      );
    }
    index = (match as any).index + match[0].length;
  }

  // Add the remaining text after emojis, if any
  if (index < input.length) {
    parts.push(<span key={index}>{input.substring(index)}</span>);
  }

  // Replace the last emoji in parts with the larger emoji emblem  }
  return (
    <span className="" onCopyCapture={handleCopyCapture}>
      {largeEmojis.length > 0 ? largeEmojis : parts}
    </span>
  );
};

// Example function to get the unified code point of an emoji
const getUnifiedCodePoint = (emoji: string) => {
  return (emoji as any)?.codePointAt(0)?.toString(16);
};

//extractTextWithoutEmoji
export const extractTextWithoutEmoji = (input: string): string => {
  // Regular expression to match emojis
  const emojiRegexPattern = emojiRegex();

  // Remove emojis from the input string
  const textWithoutEmoji = input.replace(emojiRegexPattern, "");

  return textWithoutEmoji.trim(); // Trim whitespace from both ends of the string
};
