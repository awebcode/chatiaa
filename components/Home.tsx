
import { Link } from "@/navigation";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { AiOutlineGroup, AiOutlineUser } from "react-icons/ai";
import { BsShieldCheck } from "react-icons/bs";
import { FaLock, FaSave, FaVideo } from "react-icons/fa";
const Footer = dynamic(() => import("./Footer"));
import { LuFolderSync } from "react-icons/lu";
import { RiFileTransferFill } from "react-icons/ri";
import { TbUsersGroup } from "react-icons/tb";
const Home = () => {
  return (
    <div className="container mx-auto flex flex-wrap items-center justify-center h-screen">
      {/* Left side with text and button */}
      <div className="w-full md:w-1/2 p-1 md:p-4 flex flex-col items-start py-24 sm:py-0">
        <h1 className="text-3xl   md:text-6xl  font-bold leading-10 tracking-tight dark:text-gray-300">
          <span className="text-wrap md:text-nowrap ">Let&apos;s Connect</span>{" "}
          <span className="text-wrap md:text-nowrap mt-4">with your customer</span>{" "}
          <span>in Real Time</span>
        </h1>

        <p className="xl:text-lg mt-10 mb-6 tracking-wider font-medium dark:text-gray-500 text-gray-800  ">
          Great application that allow you to chat and calling any place any time without
          any interruption
        </p>
        <Link
          href="/login"
          className=" text-white  uppercase py-3 px-6 sm:py-4 sm:px-8 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 duration-150"
        >
          Get Started
        </Link>
      </div>

      {/* Right side with image */}
      <div className="w-full md:w-1/2 p-4">
        <Image
          height={1000}
          width={1000}
          loading="lazy"
          quality={1000}
          src="/chat.svg"
          alt="Chat Image"
          className="w-full h-auto rounded"
        />
      </div>

      {/* Bottom section with cards */}
      <div className="w-full mt-8 p-1 md:p-4">
        <h1 className="text-3xl  md:text-4xl text-center my-2 md:my-4 dark:text-gray-300  font-bold leading-10 tracking-tight">
          Features for a better experience.
        </h1>
        {/* Card 1 */}
        <Card
          icon={<ChatBubbleIcon className="w-8 h-8 text-blue-500 mb-4" />}
          heading="Chat App with end to end encrytion"
          description="Start Conversations, Anytime, Anywhere. Begin chatting with your friends in real-time with ease."
        />

        {/* Card 2 */}
        <Card
          icon={<BsShieldCheck className="w-8 h-8 text-yellow-500 mb-4" />}
          heading="Keep Private"
          description="Lock Your Conversations, Unlock Your Peace of Mind. Rest assured, your conversations are secure and private."
        />

        {/* Card 3 */}
        <Card
          icon={<FaSave className="w-8 h-8 text-green-500 mb-4" />}
          heading="Saving Time & Superfast"
          description="Efficiency Redefined: Connect & Converse Swiftly. Efficient communication, saving you valuable time at lightning speed."
        />

        {/* Card 4 */}
        <Card
          icon={<FaVideo className="w-8 h-8 text-purple-500 mb-4" />}
          heading="Audio/Video/Voice Chat"
          description="Experience Seamless Connections, Hear & See Clearly. Connect with others through crystal-clear audio/video/group calls."
        />

        {/* Card 5 */}
        <Card
          icon={<LuFolderSync className="w-8 h-8 text-rose-500 mb-4" />}
          heading="Unlimited AnyType*Files Sharing"
          description="Break Limits, Share Everything. Share any type of file, unlimitedly, without constraints."
        />

        {/* Card 6 */}
        <Card
          icon={<TbUsersGroup className="w-8 h-8 text-emerald-500 mb-4" />}
          heading="Single and Group/Room Calling/Meeting with Zegocloud in Low Cost"
          description="Affordable Excellence: Connect, Converse, Conquer. Seamlessly conduct single/group/room calls and meetings with Zegocloud at an unbeatable price, backed by real-time notifications and reminders."
        />

        {/* Card 7 */}
        <Card
          icon={<AiOutlineUser className="w-8 h-8 text-violet-500 mb-4" />}
          heading="Real-Time Typing Indicator, Block/Unblock, Online Status"
          description="Stay informed with real-time typing indicators, easily manage block/unblock, and track online statuses effortlessly."
        />

        {/* Card 8 */}
        <Card
          icon={<AiOutlineGroup className="w-8 h-8 text-blue-500 mb-4" />}
          heading="Group Management by Admin"
          description="Efficiently manage groups with administrative controls. Stay organized and in control with group management features."
        />
        {/* Card 9 */}
        <Card
          icon={<RiFileTransferFill className="w-8 h-8 text-lime-500 mb-4" />}
          heading="View all send Files in Another Tab"
          description="View Sending Files in a Separate Tab. Utilize features like Messenger or WhatsApp for a seamless experience."
        />
      </div>
      <Footer />
    </div>
  );
};

const Card = ({ icon, heading, description }: any) => (
  <div className="w-full sm:w-1/2 md:w-1/4 p-1 md:p-4">
    <div className="dark:bg-gray-800 rounded p-6 shadow-md">
      <div className="text-blue-500 mb-4">{icon}</div>
      <h2 className="text-lg font-semibold mb-2">{heading}</h2>
      <p className="text-gray-500">{description}</p>
    </div>
  </div>
);

export default Home;
