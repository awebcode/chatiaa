"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMessageState } from "@/context/MessageContext";
import Image from "next/image";
import { BsPersonLock, BsThreeDots } from "react-icons/bs";
import {
  useBlockMutation,
  useDeleteSingleChatMutation,
  useLeaveChatMutation,
} from "../../mutations/Chatmutations";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { CiLogout } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
const Media = dynamic(() => import("../media/Media"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

export default function RightUserDrawer({ isUserOnline }: { isUserOnline: boolean }) {
  const { selectedChat } = useMessageState();
  // delete and block
  const blockMutation = useBlockMutation();
  const { user: currentUser } = useMessageState();
  const deleteSignleChatMutation = useDeleteSingleChatMutation(
    selectedChat?.chatId as any,
    true
  );
  const blockData = {
    chatId: selectedChat?.chatId,
    status: selectedChat?.chatBlockedBy?.some((user) => user?._id === currentUser?._id)
      ? "unblock"
      : "block",
  };

    const leaveMutation = useLeaveChatMutation(
      selectedChat?._id as any,
      currentUser?._id as any
    );
  // end delete block systems
  return (
    <div className="relative grid grid-cols-2 gap-2 w-full ">
      <Sheet>
        <SheetClose id="closeRightUserSheetDialog" className="hidden"></SheetClose>

        <SheetTrigger asChild >
          <BsThreeDots id="rightUserSheet" className="h-4 w-4 md:h-5 md:w-5 text-emerald-500  cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{selectedChat?.userInfo?.name}</SheetTitle>
          </SheetHeader>
          {/* Avatar and name*/}
          <div>
            <div className="relative  block mx-auto    h-8 w-8 md:h-10 md:w-10 ring md:ring-2 ring-violet-500 rounded-full">
              <Image
                height={35}
                width={35}
                className="rounded-full object-fill h-full w-full"
                alt={selectedChat?.userInfo?.name as any}
                src={selectedChat?.userInfo.image as any}
                loading="lazy"
              />

              <span
                className={`animate-pulse absolute bottom-0 -right-1 rounded-full  p-[6px] ${
                  isUserOnline ? "bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <h1 className="text-sm m-1 md:text-sm text-center text-nowrap font-medium text-gray-200">
              {selectedChat?.userInfo?.name}
            </h1>
          </div>
          {/* Avatar and name end*/}
          <div className="grid gap-4 py-4">
            <Media />
          </div>
          <div className="grid gap-4 py-4">
            <Button
              className="w-full text-sm  border-violet-600 hover:border-violet-700 duration-300"
              variant={"outline"}
              onClick={() => {
                if (confirm("Are you sure?")) {
                  blockMutation.mutateAsync(blockData);
                }
              }}
            >
              <BsPersonLock className="text-violet-600" />{" "}
              {selectedChat?.chatBlockedBy ? (
                selectedChat?.chatBlockedBy?.some(
                  (user) => user?._id === currentUser?._id
                ) ? (
                  <span className="text-blue-500">Unblock</span>
                ) : selectedChat?.chatBlockedBy?.length > 0 &&
                  selectedChat?.chatBlockedBy?.some(
                    (user) => user?._id !== currentUser?._id
                  ) ? (
                  <span className="">
                    {selectedChat?.chatBlockedBy[0].name} Blocked you
                  </span>
                ) : (
                  <span className="">Block</span>
                )
              ) : "Block"}
            </Button>
            <Button
              className="w-full text-sm  border-rose-600 hover:border-rose-700 duration-300"
              variant={"outline"}
              onClick={() => {
                if (confirm("Are you sure to delete?")) {
                  deleteSignleChatMutation.mutateAsync();
                }
              }}
            >
              <MdDelete className="text-rose-600" /> Delete Chat
            </Button>
            {/* <Button
              className="w-full  border-emerald-500 hover:border-emerald-600 duration-300"
              variant={"outline"}
              onClick={() => {
                if (confirm("Are you sure to leave?")) {
                  leaveMutation.mutateAsync();
                }
              }}
            >
              <CiLogout className="text-emerald-500" /> Leave Chat
            </Button> */}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
