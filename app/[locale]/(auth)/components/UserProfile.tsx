"use client";
import { useEffect, useState } from "react";
import { getProfile } from "@/functions/authActions";
import { useRouter } from "@/navigation";
import Image from "next/image";
import moment from "moment";
import { FaVideo, FaMicrophone, FaComments } from "react-icons/fa"; // Import React Icons
import { Tuser } from "@/store/types";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import UpdateUserProfileDialog from "./UpdUserProfileByAdmin";
import { useAccessChatMutation } from "../../(chat)/components/mutations/Chatmutations";
import { CLEAR_MESSAGES } from "@/context/reducers/actions";

const UserProfile = ({ userId }: { userId: string }) => {
  const router = useRouter();

  const [user, setUser] = useState<Tuser | null>(null);
  const [loading, setloading] = useState(false);
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const { onlineUsers } = useOnlineUsersStore();
  const mutaion = useAccessChatMutation("");

  const handleAccessChat = (userId: string) => {
    dispatch({ type: CLEAR_MESSAGES });
    mutaion.mutateAsync(userId as any);
    router.push("/chat");
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setloading(true);
        const user = await getProfile(userId);
        if (user) {
          setUser(user);
        }

        setloading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // router.push("/"); // Redirect to homepage in case of error
        setloading(false);
      }
    };

    fetchProfile();
  }, []);
  if (loading) {
    return <h1 className="p-2 text-center">Loading....</h1>;
  }
  return (
    <>
      {" "}
      {user && (
        <div className="container mx-auto flex items-center flex-col justify-center h-[60vh]">
          {/* <UpdateUserProfileDialog currentUser={user} /> */}
          <div className="flex flex-col p-8 rounded-lg shadow-md max-w-lg">
            <h1 className="text-2xl font-semibold mb-4">{user?.name}'s Profile</h1>

            <div className="flex flex-col items-center space-x-4">
              <div className="relative  p-[2px] h-8 w-8 md:h-10 md:w-10 ring md:ring-2 ring-violet-500 rounded-full">
                <Image
                  height={35}
                  width={35}
                  className="rounded-full object-fill h-full w-full"
                  alt={user?.name as any}
                  src={user?.image as any}
                  loading="lazy"
                />

                <span
                  className={`absolute bottom-0 -right-1 rounded-full  p-[6px] ${
                    onlineUsers.some((u) => u.userId === user?._id)
                      ? "bg-green-500"
                      : "bg-rose-500"
                  }`}
                ></span>
              </div>

              <div>
                <p className="text-lg font-semibold">Id:- {(user as any)?._id}</p>
                <p className="text-lg font-semibold">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-gray-600 text-sm">{user?.bio}</p>
                <p className="text-gray-600">
                  Joined:-{moment(user?.createdAt).format("llll")}
                </p>
              </div>
            </div>
            {user?.role === "admin" && <UpdateUserProfileDialog currentUser={user} />}

            <div className="flex items-center justify-center mt-8 space-x-4">
              {/* Video Icon */}
              <FaVideo
                onClick={() => handleAccessChat(user?._id)}
                className="text-3xl text-blue-500 cursor-pointer hover:text-blue-700"
              />

              {/* Audio Icon */}
              <FaMicrophone
                onClick={() => handleAccessChat(user?._id)}
                className="text-3xl text-green-500 cursor-pointer hover:text-green-700"
              />

              {/* Chat Icon */}
              <FaComments
                onClick={() => handleAccessChat(user?._id)}
                className="text-3xl text-purple-500 cursor-pointer hover:text-purple-700"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
