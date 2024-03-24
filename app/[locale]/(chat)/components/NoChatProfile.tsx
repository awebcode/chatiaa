import Image from "next/image";
import React from "react";
import moment from "moment";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useChatStore } from "@/store/useChat";
import { useUserStore } from "@/store/useUser";
import { IChat } from "@/context/reducers/interfaces";

const NoChatProfile = ({ selectedChat }: { selectedChat: IChat }) => {
  const { onlineUsers } = useOnlineUsersStore();
  const { currentUser } = useUserStore();
  const isUserOnline = onlineUsers.some((u: any) =>
    selectedChat?.isGroupChat
      ? selectedChat?.users.some(
          (user: any) => user._id === u.id && user._id !== currentUser?._id
        )
      : selectedChat?.userInfo?._id === u.id
  )
  return (
    <div>
      <div className="max-w-sm bg-gray-200 dark:bg-gray-800 mx-auto m-20 rounded-lg shadow-md p-4">
        <div className="relative h-14 md:h-20 w-14 md:w-20 block mx-auto ring-4 ring-violet-600 rounded-full">
          {" "}
          <Image
            height={80}
            width={80}
            className="rounded-full mx-auto h-full w-full"
            src={selectedChat?.userInfo?.image}
            alt={selectedChat?.userInfo?.name}
          />
          <span
            className={`absolute bottom-0 right-0 rounded-full p-[7px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
        <h2 className="text-center text-2xl font-semibold mt-3">
          {selectedChat?.userInfo?.name}
        </h2>
        <h2 className="text-center text-sm font-semibold mt-3">
          {selectedChat?.userInfo?.email}
        </h2>
        <h2 className="text-center text-sm font-semibold mt-3">
          {moment(selectedChat?.userInfo?.createdAt).format("llll")}
        </h2>
        <p className="text-center  mt-1">Software Engineer</p>
        <div className="flex text-[10px] md:text-x justify-center mt-5">
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            Twitter
          </a>
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            LinkedIn
          </a>
          <a href="#" className="text-blue-500 hover:text-blue-700 mx-3">
            GitHub
          </a>
        </div>
        <div className="mt-3 text-center">
          <p className="text-[10px] md:text-xs mt-2">
            {selectedChat?.userInfo?.name} is a software engineer with over 10 years of
            experience in developing web and mobile applications. He is skilled in
            JavaScript, React, and Node.js.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatProfile;
