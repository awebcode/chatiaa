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

export default function SearchDrawer() {
  return (
    <div className="">
      <Sheet>
        <SheetClose id="closeSearchUsersSheet" className="hidden"></SheetClose>

        <SheetTrigger asChild className="w-full">
          <Button variant="secondary" size={"lg"}>
            Search User
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-screen"> 
          <SheetHeader>
            <SheetTitle>Search User</SheetTitle>
            <Drawer />
          </SheetHeader>
          <div className="grid gap-4 py-4">{/* <UserSearch  /> */}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
