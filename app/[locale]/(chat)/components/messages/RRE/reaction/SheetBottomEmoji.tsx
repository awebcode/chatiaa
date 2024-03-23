"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmojiStyle, SuggestionMode, Theme } from "emoji-picker-react";
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false }
);
import { MdAdd } from "react-icons/md";

export function EmojiBottomSheet({
  message,
  onEmojiClick,
  setIsOpenReactModal,
}: {
  message: any;
  openEmoji: any;
  onEmojiClick: any;
  setIsOpenReactModal: any;
}) {
  return (
    <div className="flex md:hidden w-full">
      {" "}
      <Sheet>
        <SheetTrigger asChild>
          <MdAdd className={`text-gray-300 h-5 w-5 md:h-6 md:w-6 mr-1 cursor-pointer `} />
        </SheetTrigger>
        <SheetContent side={"bottom"}>
          <EmojiPicker
            className="w-auto h-auto block mx-auto"
            onEmojiClick={(e) => {
              onEmojiClick(e, message._id);
              setIsOpenReactModal(false);
            }}
            autoFocusSearch
            theme={Theme.DARK}
            lazyLoadEmojis
            // previewConfig={{defaultEmoji:<Emoji/>}}

            emojiStyle={EmojiStyle.APPLE}
            searchPlaceholder="Search chat emojis..."
            suggestedEmojisMode={SuggestionMode.RECENT}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
