"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMessageState } from "@/context/MessageContext";
import dynamic from "next/dynamic";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import Media from "../media/Media";
import Members from "./Members";
const UpdateGroupDialog = dynamic(() => import("./update/UpdateGroupDialog"));
export default function RightGroupDrawer({ isUserOnline }: { isUserOnline: boolean }) {
  const { selectedChat } = useMessageState();
  console.log({ selectedChat });
  
  return (
    <div className="relative grid grid-cols-2 gap-2 w-full ">
      <Sheet>
        <SheetClose id="closeRightGroupSheetDialog" className="hidden"></SheetClose>

        <SheetTrigger asChild>
          <BsThreeDots className="h-4 w-4 md:h-6 md:w-6  cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-center">
              {" "}
              {selectedChat?.chatName} Group Info
            </SheetTitle>
          </SheetHeader>
          {/* Avatar and name*/}
          <div>
            {" "}
            <div className="relative block mx-auto   h-8 w-8 md:h-10 md:w-10 ring md:ring-2 ring-violet-500 rounded-full">
              <Image
                height={35}
                width={35}
                className="rounded-full object-fill h-full w-full"
                alt={selectedChat?.chatName as any}
                src={selectedChat?.groupInfo?.image?.url as any}
                loading="lazy"
              />
              {/* update image name dialog */}
              <div className="absolute -top-2 -right-1">
                <UpdateGroupDialog />
              </div>
              <span
                className={`absolute bottom-0 -right-1 rounded-full  p-[6px] ${
                  isUserOnline ? "bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <h1 className="text-sm md:text-sm text-center font-medium text-gray-200">
              {selectedChat?.chatName} <UpdateGroupDialog />
            </h1>
          </div>
          {/* Description */}

          <div>
            {selectedChat?.groupInfo?.description ? (
              <p className="text-xs p-2 rounded text-gray-200 border ">
                {selectedChat?.groupInfo?.description.slice(0, 200)} <UpdateGroupDialog />
              </p>
            ) : null}
          </div>
          {/* Avatar and name end*/}
          <div className="grid gap-4 py-4">
            <Media />
          </div>
          <div className="grid gap-4 py-4">
            <Members />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
