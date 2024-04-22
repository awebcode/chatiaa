"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/navigation";
import { BsThreeDots } from "react-icons/bs";
import { Tuser } from "@/store/types";

import { useQueryClient } from "@tanstack/react-query";
import { deleteUserByAdmin } from "@/functions/authActions";


export default function UserDropdownMenu({ user }: { user: Tuser }) {
  const queryClient = useQueryClient();

  const deleteUserHanlder = async () => {
    await deleteUserByAdmin(user._id);

    queryClient.invalidateQueries({ queryKey: ["fetch-server-user"] });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <BsThreeDots className="text-xl" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Menus</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Link href={`/user/profile/${user?._id}`}>View profile</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={`/user/profile/${user?._id}`}>Edit profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-rose-500" onClick={deleteUserHanlder}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
