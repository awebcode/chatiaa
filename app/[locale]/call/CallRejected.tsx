import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useMessageState } from "@/context/MessageContext";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";

export function RejectedCallDialog() {
  const { callInfo } = useMessageState();
   const [isOpen, setIsOpen] = useState(true);

   useEffect(() => {
     const timer = setTimeout(() => {
       setIsOpen(false);
     }, 3000);

     return () => clearTimeout(timer);
   }, []);
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-[380px] md:max-w-[425px] dark:bg-white dark:text-black rounded-2xl ring p-4 flex items-center justify-center flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-rose-700 text-xl md:text-2xl">
            <HiOutlinePhoneMissedCall /> Call Rejected
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-1">
          <div className=" h-20 w-20">
            <Image
              src={callInfo?.rejectedBy?.image as string}
              alt={callInfo?.rejectedBy?.name as string}
              height={80}
              width={80}
              className="h-full w-full object-cover ring ring-blue-600 rounded-full"
              loading="lazy"
            />
          </div>
          <div className="py-2">
            <h3 className="text-xl font-medium ">
              <span className="text-blue-500 mx-2">
                {callInfo?.rejectedBy?.name as string}
              </span>
              Rejected the call
            </h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
