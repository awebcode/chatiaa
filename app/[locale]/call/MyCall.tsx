import { RiPhoneLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { CLEAR_CALL } from "@/context/reducers/actions";
import { useSocketContext } from "@/context/SocketContextProvider";
import { IoCallOutline } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";
export default function MyCallPage() {
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  const { callInfo, user } = useMessageState();
   
  const handleCancel = () => {
     dispatch({ type: CLEAR_CALL });
     socket.emit("caller_call_rejected", { ...callInfo, rejectedBy: user });
     socket.emit("user-on-call-message", {
       message: `📞 ${user?.name + ` Cancelled calling `}`,
       chatId: callInfo?.chatId,
       user: user,
       type: "call-notify",
     });
    document.getElementById("my-call-dialog")?.click();
  };
 console.log({callInfo})
 
  return (
    <Dialog open>
      <DialogContent className="max-w-[380px] md:max-w-[425px] dark:bg-white dark:text-black rounded-2xl ring p-4 flex items-center justify-center flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-600 text-xl md:text-2xl animate-pulse">
            You calling to{" "}
            <span className="text-blue-600">
              {callInfo?.isGroupChat
                ? callInfo?.groupInfo?.groupName
                : callInfo?.receiver?.name}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className=" h-20 w-20 ">
            <Image
              src={
                callInfo?.isGroupChat
                  ? callInfo?.groupInfo?.image
                  : (callInfo?.receiver?.image as string)
              }
              alt={callInfo?.sender?.name as string}
              height={80}
              width={80}
              className="h-full w-full object-cover ring ring-blue-600 rounded-full"
              loading="lazy"
            />
          </div>
        </div>
        <DialogFooter>
          <TooltipProvider>
            <div className="flex justify-end items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleCancel} className="mr-2 bg-white">
                    <HiOutlinePhoneMissedCall className="h-7 w-7 text-rose-700 animate-pulse" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel calling..</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </DialogFooter>
        <DialogClose className="hidden" id="my-call-dialog"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
