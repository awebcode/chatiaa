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
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function DeleteButton({
  btnClassName,
  buttonText,
  title,
  desc,
  onClick,
  navigatePath,
}: {
  btnClassName: string;
  buttonText: string;
  title: string;
  desc: string;
  onClick: () => Promise<void> | void;
  navigatePath: string;
}) {
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={cn(`m-2  w-full`, btnClassName)}>{buttonText}</Button>
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
            {buttonText || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
