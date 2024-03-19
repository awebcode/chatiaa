"use client";

import { useRouter } from "@/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteButton({
  buttonText,
  title,
  desc,
  onClick,
  navigatePath,
}: {
    buttonText: string;
  title: string;
  desc: string;
  onClick: () => Promise<void>;
  navigatePath: string;
}) {
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="m-2  w-full">{buttonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Are you absolutely sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {desc ||
              "This action cannot be undone. This will permanently delete your account andremove your data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-500 hover:bg-rose-600"
            onClick={async () => {
              await onClick();
              
              router.push(navigatePath);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
