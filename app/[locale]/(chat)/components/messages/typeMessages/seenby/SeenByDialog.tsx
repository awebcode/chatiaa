import LoaderComponent from "@/components/Loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IMessage } from "@/context/reducers/interfaces";
import dynamic from "next/dynamic";
const ViewersDialog = dynamic(() => import("./Viewers"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

export default function SeenByDialog({ message }: { message: IMessage }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="text-[10px] ml-1 text-blue-500 cursor-pointer">view</span>
      </DialogTrigger>
      <DialogContent className="max-h-screen ">
        <DialogHeader>
          <DialogTitle>Seen by </DialogTitle>
          <DialogDescription>These users are seen this message</DialogDescription>
        </DialogHeader>

        <ViewersDialog message={message} />

        <DialogClose id="closeSeenByDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
