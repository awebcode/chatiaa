import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import {  getInitialFilesInChat } from "@/functions/chatActions";
import {  useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useState } from "react";
const FilesSheet = dynamic(() => import("./FileSheet"));
const Media = () => {
  const { selectedChat } = useMessageState();
  const { data, isFetching, isLoading } = useQuery({
    queryKey: [ "group"],
    queryFn:()=> getInitialFilesInChat(selectedChat?.chatId as string),
  });
  return (
    <>
      <h1 className="text-sm md:text-lg text-gray-600">Media & files</h1>
      {data?.total > 0 ? (
        <div className="w-full flex items-center justify-between">
          <div className="flex gap-1  items-center ">
            {data?.files &&
              data?.files?.length > 0 &&
              data?.files?.map((file: IMessage, index: number) => {
                return (
                  <div className="h-10 w-10 rounded-lg">
                    <Image
                      src={file.file.url}
                      alt="file"
                      height={80}
                      width={80}
                      className="h-full w-full rounded-lg"
                    />
                  </div>
                );
              })}
          </div>
          <FilesSheet total={data?.total} />
        </div>
      ) : (
        <h1 className="text-lg font-medium text-center text-gray-200">No files</h1>
      )}
    </>
  );
};

export default Media;
