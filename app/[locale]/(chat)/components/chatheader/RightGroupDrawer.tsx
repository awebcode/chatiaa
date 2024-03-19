
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import { BsThreeDots } from "react-icons/bs";

export default function RightGroupDrawer() {
  return (
    <div className="relative grid grid-cols-2 gap-2 w-full ">
      <Sheet>
        <SheetClose id="closeSheetDialog" className="hidden"></SheetClose>

        <SheetTrigger asChild>
            <BsThreeDots className="h-4 w-4 md:h-6 md:w-6  cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle> Group Right Drawer</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">{/* <UserSearch  /> */}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
