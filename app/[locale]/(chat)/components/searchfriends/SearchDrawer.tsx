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

export function SearchDrawer() {
  return (
    <div className="">
      <Sheet>
        <SheetClose id="closeSheetDialog" className="hidden"></SheetClose>

        <SheetTrigger asChild className="w-full">
          <Button variant="default" size={"lg"}>
            Search User
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
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
