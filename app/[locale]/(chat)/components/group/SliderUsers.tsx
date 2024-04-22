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
      className=" flex justify-center items-center gap-2  w-full max-w-sm "
    >
      <CarouselContent>
        {selectedAddGroupUsers.map((user, index) => (
          <CarouselItem key={index} className="basis-1/3 lg:basis-1/4 m-2">
            <div className="p-1">
              <Card>
                <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                  <div className=" rounded-full relative h-8 w-8 md:h-12 md:w-12">
                    <Image
                      alt="Avatar"
                      src={user.image}
                      height={80}
                      width={80}
                      loading="lazy"
                      className="object-cover h-full w-full"
                    />
                    <span className="absolute right-0 top-1 p-[2px] rounded-full bg-gray-100">
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
              </Card>
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
