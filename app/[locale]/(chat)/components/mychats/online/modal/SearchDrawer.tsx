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
    <div >
      <Sheet>
        <SheetClose id="closeOnlineUsersSheet" className="hidden"></SheetClose>

        <SheetTrigger asChild className="w-full">
          <Button variant="secondary" size={"lg"}>
            See all
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-screen" style={{width:"100vw"}}>
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
