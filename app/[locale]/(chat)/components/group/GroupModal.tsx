import LoaderComponent from "@/components/Loader";
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
import { useMediaQuery } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
const SearchGroupModal = dynamic(() => import("./SearchGroupModal"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

export default function CreateGroupModal() {
  const isSmallDevice=useMediaQuery("only screen and (max-width:768px)")
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={isSmallDevice?"sm":"lg"} className="mt-1 md:mt-2 w-full bg-blue-600 hover:bg-blue-700">
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
