"use client";

import LoaderComponent from "@/components/Loader";
import { SheetContent } from "@/components/ui/sheet";
import { EmojiStyle, SuggestionMode, Theme } from "emoji-picker-react";
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react").then((module) => {
      return module.default || module;
    });
  },
  { ssr: false, loading: () => <LoaderComponent text="Loading emojis..." /> }
);

export default function EmojiBottomSheet({
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
    <div className="flex  w-full">
      {" "}
      {/* <SheetTrigger asChild>
          <MdAdd className={`text-gray-300 h-5 w-5 md:h-6 md:w-6 mr-1 cursor-pointer `} />
        </SheetTrigger> */}
      <SheetContent side={"bottom"}>
        <EmojiPicker
          open
          className="block mx-auto w-full overflow-scroll"
          onEmojiClick={(e) => {
            onEmojiClick(e, message._id);
            setIsOpenReactModal(false);
          }}
          theme={Theme.DARK}
          lazyLoadEmojis
          // previewConfig={{defaultEmoji:<Emoji/>}}
          autoFocusSearch={false}
          emojiStyle={EmojiStyle.APPLE}
          searchPlaceholder="Search chat emojis..."
          suggestedEmojisMode={SuggestionMode.RECENT}
        />
      </SheetContent>
    </div>
  );
}
