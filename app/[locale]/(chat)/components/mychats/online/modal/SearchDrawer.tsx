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
import dynamic from "next/dynamic"
const Drawer = dynamic(() => import("./Drawer"));

export default function OnlineUsesDrawer() {
  return (
    <div className="">
      <Sheet>
        <SheetClose id="closeOnlineUsersSheet" className="hidden"></SheetClose>

        <SheetTrigger asChild className="w-full">
          <Button variant="secondary" size={"lg"}>
            See all
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Online Users</SheetTitle>
            <Drawer />
          </SheetHeader>
          <div className="grid gap-4 py-4">{/* <UserSearch  /> */}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
