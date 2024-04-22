import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { CLEAR_MESSAGES} from "@/context/reducers/actions";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import OnlineUsesDrawer from "./modal/SearchDrawer";
import { useAccessChatMutation } from "../../mutations/Chatmutations";

export default function OnlineFriends() {
  const { onlineUsers} = useOnlineUsersStore();
  const dispatch = useMessageDispatch();
  const { user: currentUser } = useMessageState();
  const mutaion = useAccessChatMutation("closeOnlineUsersSheet");

  const handleClick = (userId: string) => {
    dispatch({ type: CLEAR_MESSAGES });
    mutaion.mutateAsync(userId as any);
  };

  return (
    <div className="flex items-center ">
      {" "}
      <Carousel
        opts={{
          align: "center",
        }}
        className="basis-[95%] max-w-60 md:max-w-80 block mx-auto "
      >
        <CarouselContent className="px-2 ">
          {onlineUsers &&
            onlineUsers.length > 0 &&
            onlineUsers
              .filter((curr) => curr.userInfo?._id !== currentUser?._id)
              .map((u, index) => (
                <CarouselItem
                  onClick={() => handleClick(u.userId)}
                  key={index}
                  className="basis-auto cursor-pointer flex flex-col justify-center items-center"
                >
                  <div className="relative flex flex-col  p-[2px] h-8 w-8 md:h-10 md:w-10  rounded-full">
                    <Image
                      height={35}
                      width={35}
                      className="rounded-full object-fill h-full w-full"
                      alt={u?.userInfo?.name}
                      src={u?.userInfo?.image}
                      loading="lazy"
                    />

                    <span
                      className={`absolute bottom-0 right-1 rounded-full  p-[4px] bg-green-500
                  }`}
                    ></span>
                  </div>
                  <p className="font-medium text-[8px] text-center">
                    {u?.userInfo?.name}
                  </p>
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious
          className={`${
            onlineUsers.filter((curr) => curr.userInfo?._id !== currentUser?._id).length >
            4
              ? "flex"
              : "hidden"
          }`}
        />
        <CarouselNext
          className={`${
            onlineUsers.filter((curr) => curr.userInfo?._id !== currentUser?._id).length >
            4
              ? "flex"
              : "hidden"
          }`}
        />
      </Carousel>
      <OnlineUsesDrawer />
    </div>
  );
}
