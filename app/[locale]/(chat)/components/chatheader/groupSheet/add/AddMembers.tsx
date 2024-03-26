import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
const SearchGroupModal = dynamic(() => import("./SearchGroupModal"));
export default  function AddMembers() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 dark:bg-blue-600 m-1">+Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>+Add Members</DialogTitle>
          <DialogDescription>
            add more members and enjoy group chatting with your friends.
          </DialogDescription>
        </DialogHeader>
        <SearchGroupModal/>
      </DialogContent>
    </Dialog>
  );
}
