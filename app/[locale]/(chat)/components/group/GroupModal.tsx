import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
const SearchGroupModal = dynamic(() => import("./SearchGroupModal"));

export default function CreateGroupModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"lg"} className="mt-2 w-full bg-blue-600 hover:bg-blue-700">
          +Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen ">
        <DialogHeader>
          <DialogTitle>Choose friends</DialogTitle>
          <DialogDescription>
            Choose friends to create group chat and enjoy secure unlimited messaging
          </DialogDescription>
        </DialogHeader>

        <SearchGroupModal />
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
        <DialogClose id="closeCreateGroupDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
