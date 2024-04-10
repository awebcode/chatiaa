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
import { ACCEPT_CALL, CLEAR_CALL, REJECT_CALL } from "@/context/reducers/actions";
import { useSocketContext } from "@/context/SocketContextProvider";
import { useRouter } from "@/navigation";
import { VscCallIncoming } from "react-icons/vsc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";
export default function IncomingCallDialog() {
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  const { callInfo, user } = useMessageState();
  const router = useRouter();

  const handleDeclined = () => {
    dispatch({ type: REJECT_CALL });
    dispatch({ type: CLEAR_CALL });
    socket.emit("call_rejected", { receiver: callInfo?.sender, rejectedBy: user });
    socket.emit("user-on-call-message", {
      message: `📞 ${
        user?.name + ` Declined a call that was ${callInfo?.sender?.name} `
      }`,
      chatId: callInfo?.chatId,
      user: user,
      type: "call-notify",
    });
    document.getElementById("incoming-call-dialog")?.click();
  };
  const handleAccepted = () => {
    dispatch({ type: ACCEPT_CALL, payload: callInfo });
    socket.emit("call_accepted", { ...callInfo, receiver: callInfo?.sender });

    socket.emit("user-on-call-message", {
      message: `${`📲 That was a ongoing call from ${callInfo?.sender?.name} `}`,
      chatId: callInfo?.chatId,
      user: user,
      type: "call-notify",
    });
    document.getElementById("incoming-call-dialog")?.click();
    dispatch({ type: CLEAR_CALL });
    router.push(`/call/${callInfo?.chatId}`);
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-[380px] dark:bg-white dark:text-black md:max-w-[425px] rounded-2xl ring p-4 flex items-center justify-center flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-600 text-xl md:text-2xl">
            Incoming Call
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 flex gap-1 flex-col items-center">
          <div className="h-20 w-20 rounded-full">
            <Image
              src={
                callInfo?.isGroupChat
                  ? callInfo?.groupInfo.image
                  : (callInfo?.sender.image as string)
              }
              alt={callInfo?.sender.name as string}
              height={80}
              width={80}
              className="h-full w-full object-cover ring ring-blue-600 rounded-full"
              loading="lazy"
            />
          </div>
          <div className="  ">
            <h3>
              {callInfo?.isGroupChat
                ? callInfo?.groupInfo?.groupName + "called by" + callInfo?.sender.name
                : callInfo?.sender.name}
            </h3>
          </div>
        </div>
        <DialogFooter>
          <TooltipProvider>
            <div className="flex justify-end items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleDeclined} className="mr-2">
                    <HiOutlinePhoneMissedCall className="h-6 w-6 text-rose-700 animate-pulse" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decline</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"outline"} onClick={handleAccepted}>
                    <VscCallIncoming className="h-6 w-6 text-green-600 hover:text-green-700 animate-pulse" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept call</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </DialogFooter>
        <DialogClose className="hidden" id="incoming-call-dialog"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
