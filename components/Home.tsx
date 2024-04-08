import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { Link } from "@/navigation";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { BsShieldCheck } from "react-icons/bs";
import { FaSave, FaVideo } from "react-icons/fa";
import { LuFolderSync } from "react-icons/lu";
import { RiFileTransferFill } from "react-icons/ri";
import { TbUsersGroup } from "react-icons/tb";
import { AiOutlineUser, AiOutlineGroup } from "react-icons/ai";
import { ChatBubbleLeftIcon } from "@heroicons/react/20/solid";
const Footer = dynamic(() => import("./Footer"));

const Home = () => {
  // Define an array of card items with their respective icon, title, description, and icon color
  const cardItems = [
    {
      icon: <ChatBubbleIcon className="w-8 h-8 text-blue-500 mb-4" />,
      title: "Chat App with end to end encrytion",
      description:
        "Start Conversations, Anytime, Anywhere. Begin chatting with your friends,partners and customers in real-time with ease.",
      color: "blue",
    },
    {
      icon: <BsShieldCheck className="w-8 h-8 text-yellow-500 mb-4" />,
      title: "Keep private chat",
      description:
        "Lock Your Conversations, Unlock Your Peace of Mind. Rest assured, your conversations are secure and private.",
      color: "yellow",
    },
    {
      icon: <FaSave className="w-8 h-8 text-green-500 mb-4" />,
      title: "Saving your time & Superfast",
      description:
        "Efficiency Redefined: Connect & Converse Swiftly. Efficient communication, saving you valuable time at lightning speed.",
      color: "green",
    },
    {
      icon: <FaVideo className="w-8 h-8 text-purple-500 mb-4" />,
      title: "Audio/Video/Voice Chat",
      description:
        "Experience Seamless Connections, Hear & See Clearly. Connect with others through crystal-clear audio/video/group calls.",
      color: "purple",
    },
    {
      icon: <LuFolderSync className="w-8 h-8 text-rose-500 mb-4" />,
      title: "Unlimited AnyType*Files Sharing",
      description:
        "Break Limits, Share Everything. Share any type of file, unlimitedly, without constraints.",
      color: "rose",
    },
    {
      icon: <TbUsersGroup className="w-8 h-8 text-emerald-500 mb-4" />,
      title: "Single and Group/Room Calling/Meeting with Zegocloud in Low Cost",
      description:
        "Affordable Excellence: Connect, Converse, Conquer. Seamlessly conduct single/group/room calls and meetings with Zegocloud at an unbeatable price, backed by real-time notifications and reminders.",
      color: "emerald",
    },
    {
      icon: <AiOutlineUser className="w-8 h-8 text-violet-500 mb-4" />,
      title: "Real-Time Typing Indicator, Block/Unblock, Online Status",
      description:
        "Stay informed with real-time typing indicators, easily manage block/unblock, and track online statuses effortlessly.",
      color: "violet",
    },
    {
      icon: <AiOutlineGroup className="w-8 h-8 text-blue-500 mb-4" />,
      title: "Group/users/online users Management by Admin",
      description:
        "Efficiently manage groups with administrative controls. Stay organized and in control with group management features.",
      color: "blue",
    },
    {
      icon: <RiFileTransferFill className="w-8 h-8 text-lime-500 mb-4" />,
      title: "View all send Files in new window with lazy loading and infinite scrolling",
      description:
        "View Sending Files in a Separate Tab/window.full application data fetching using (SSR) and infinite scrolling and code spiliting that&apos;s why it&apos;s very big application but super fast loading. Utilize features like Messenger or WhatsApp for a seamless experience.",
      color: "lime",
    },
    {
      icon: <ChatBubbleIcon className="w-8 h-8 text-violet-500 mb-4" />,
      title:
        "Enhanced Chat Experience with Real-time Reactions, Message Editing,Message viewers, and More",
      description:
        "Experience an advanced chat interface with features like on-message emoji reactions, real-time message viewers, reply functionality, message editing, unsending, removal options, and more. Our application boasts seamless file transfer, utilizes SSR for fast data fetching, incorporates infinite scrolling, and code splitting for lightning-fast loading. Enjoy a Messenger or WhatsApp-like experience for effortless communication.",
      color: "violet",
    },

    {
      icon: <ChatBubbleLeftIcon className="w-8 h-8 text-emerald-500 mb-4" />,
      title: "Elevate Your Chat Experience with Advanced Features",
      description:
        "Unleash the potential of your chats with our feature-rich application. From on-message emoji reactions to real-time message viewers, reply options, and message editing, we've got you covered. With additional functionalities like file transfer in a separate tab and lightning-fast data fetching using SSR and infinite scrolling, our application promises a next-level experience reminiscent of Messenger or WhatsApp. Elevate your communication game today.",
      color: "emerald",
    },
  ];

  return (
    <div className="container mx-auto flex flex-wrap items-center justify-center h-screen">
      {/* Left side with text and button */}
      <div className="w-full md:w-1/2 p-1 md:p-4 flex flex-col items-start py-24 sm:py-0">
        <h1 className="text-3xl md:text-6xl font-bold leading-10 tracking-tight dark:text-gray-300">
          <span className="text-wrap md:text-nowrap ">Let&apos;s Connect</span>{" "}
          <span className="text-wrap md:text-nowrap mt-4">with your customer</span>{" "}
          <span>in Real Time</span>
        </h1>

        <p className="xl:text-lg mt-10 mb-6 tracking-wider font-medium dark:text-gray-500 text-gray-800">
          Great application that allow you to chat and calling any place any time without
          any interruption
        </p>
        <Link
          href="/login"
          className="text-white uppercase py-3 px-6 sm:py-4 sm:px-8 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 duration-150"
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
        <h1 className="text-3xl md:text-4xl text-center my-2 md:my-4 dark:text-gray-300 font-bold leading-10 tracking-tight">
          Features for a better experience.
        </h1>
        {/* Card elements */}
        <div className="flex gap-1 items-center flex-wrap justify-around">
          {cardItems.map((item, index) => (
            <Card
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              color={item.color}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Card component
const Card = ({ icon, title, description, color }: any) => (
  <div className={`w-full sm:w-1/2 md:w-1/4 p-1 md:p-4`}>
    <div
      className={`rounded p-6 shadow-md text-${color}-500 duration-500 transition-all   hover:ring-2 hover:ring-yellow-500`}
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);


export default Home;
