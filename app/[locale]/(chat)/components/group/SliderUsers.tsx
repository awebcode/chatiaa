import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useGroupStore from "@/store/useGroupStore";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";

export default function SliderUsers() {
  const { selectedAddGroupUsers, removeAddSelectedUser } = useGroupStore();

  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className=" flex justify-center items-center gap-2  w-full max-w-[150px] md:max-w-sm"
    >
      <CarouselContent>
        {selectedAddGroupUsers.map((user, index) => (
          <CarouselItem key={index} className="basis-1/2 md:basis-1/3 m-1 border-none">
            <div className="p-1">
              <CardContent className="flex flex-col  items-center justify-center p-6">
                <div className=" rounded-full relative h-8 w-8 md:h-12 md:w-12">
                  <Image
                    alt="Avatar"
                    src={user.image}
                    height={80}
                    width={80}
                    loading="lazy"
                    className="object-cover h-full w-full"
                  />
                  <span
                    className={` absolute bottom-0 right-0 rounded-full ring-1 ring-gray-900 p-1 md:p-[5px] ${
                      user?.onlineStatus==="online" ? "animate-pulse bg-green-500" : "bg-rose-500"
                    }`}
                  ></span>
                  <span className="absolute right-0 top-1 p-[1px] rounded-full bg-gray-100">
                    {" "}
                    <IoMdClose
                      onClick={() => removeAddSelectedUser(user._id)}
                      className="  text-red-600 cursor-pointer text-[10px]"
                    />
                  </span>
                </div>
                <span className="text-xs md:text-sm  font-semibold text-gray-300">
                  {user.name}
                </span>
              </CardContent>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className={`${selectedAddGroupUsers.length > 0 ? "flex" : "hidden"}`}
      />
      <CarouselNext
        className={`${selectedAddGroupUsers.length > 0 ? "flex" : "hidden"}`}
      />
    </Carousel>
  );
}
