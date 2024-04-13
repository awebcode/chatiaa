"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { BsShieldCheck } from "react-icons/bs";
import { FaSave, FaVideo } from "react-icons/fa";
import { LuFolderSync } from "react-icons/lu";
import { RiFileTransferFill } from "react-icons/ri";
import { TbMessageCircleQuestion, TbUsersGroup } from "react-icons/tb";
import { AiOutlineUser, AiOutlineGroup } from "react-icons/ai";
import { ChatBubbleLeftIcon } from "@heroicons/react/20/solid";
const Footer = dynamic(() => import("./Footer"));
import { motion } from "framer-motion";
import AnimateSvg from "./AnimateSvg";
import Lottie from "react-lottie";
import * as ChatAnim from "./ChatLottie.json";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { Scrollbar } from "smooth-scrollbar-react";
import type { Scrollbar as BaseScrollbar } from "smooth-scrollbar/scrollbar";
const Home = () => {
  
   const scrollbar = useRef<BaseScrollbar | null>(null);
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
      title: "Secure Real-Time Notifications: Keep Conversations Safe and Private",
      description:
        "Lock Your Conversations, Unlock Your Peace of Mind. Our real-time notification toast ensures your messages are secure and private, with instant reply functionality. Stay connected with sound alerts for seamless communication, guaranteeing your privacy and peace of mind.",
      color: "yellow",
    },

    {
      icon: <FaSave className="w-8 h-8 text-green-500 mb-4" />,
      title: "Low latency messaging",
      description:
        "Efficiency Redefined: Connect & Converse Swiftly. Efficient communication, saving you valuable time at lightning speed.",
      color: "green",
    },
    {
      icon: <TbMessageCircleQuestion className="w-8 h-8 text-purple-500 mb-4" />,
      title:
        "Enhanced Multimedia Communication: Enjoy Limitless Messaging and Calling Options",
      description:
        "Immerse yourself in seamless connections with our comprehensive multimedia features. Send unlimited images, PDFs, audio, video, and voice messages effortlessly. Stay connected with crystal-clear audio, video, and group calls, ensuring you hear and see clearly during every interaction.",
      color: "purple",
    },
    {
      icon: <LuFolderSync className="w-8 h-8 text-rose-500 mb-4" />,
      title: "Unlimited Anytype realtime*file sharing",
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
      title: "View all send Files in one place with lazy loading and infinite scrolling",
      description:
        "View Sending Files in a Separate Tab/window.full application data fetching using (SSR) and infinite scrolling and code spiliting that&apos;s why it&apos;s very big application but super fast loading. Utilize features like Messenger or WhatsApp for a seamless experience.",
      color: "lime",
    },

    {
      icon: <MdOutlineAdminPanelSettings className="w-8 h-8 text-yellow-500 mb-4" />,
      title: "Empower Group Dynamics: Manage Administrators and Members with Ease",
      description:
        "Take control of your group conversations effortlessly. With our real-time update feature, remove users as admins, view user and admin lists, and seamlessly designate new admins if all current admins leave. Stay organized and in control of your group's dynamics for smooth communication.",
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
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ChatAnim,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

   
  return (
    <div className="overflow-y-scroll  max-h-[100vh] ">
      <Scrollbar
        ref={scrollbar as any}
        plugins={{
          overscroll: {
            effect: "bounce",
          } as any,
        }}
        className="p-0 md:container   pb-20 mx-auto flex flex-wrap items-center justify-center h-screen"
      >
        <div className="w-full md:w-1/2 p-1 md:p-4 flex flex-col items-start py-24 sm:py-0">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-6xl font-bold leading-10 tracking-tight dark:text-gray-300"
          >
            <span className="text-wrap md:text-nowrap ">Let's Connect</span>{" "}
            <span className="text-wrap md:text-nowrap mt-4">with your friends</span>{" "}
            <span>in Real Time</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:text-lg mt-10 mb-6 tracking-wider font-medium dark:text-gray-500 text-gray-800"
          >
            Great application that allow you to chat and calling any place any time
            without any interruption
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            href="/login"
            className="text-white uppercase py-3 px-6 sm:py-4 sm:px-8 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 duration-150"
          >
            Get Started
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full md:w-1/2 p-4"
        >
          <Lottie options={defaultOptions} />
          {/* <Image
          height={1000}
          width={1000}
          loading="lazy"
          quality={1000}
          src="https://lottie.host/embed/ab53ab1c-ad4a-4055-97cb-797ea3556f03/9gCaBvFRqu.json"
          alt="Chat Image"
          className="w-full h-auto rounded"
        /> */}
        </motion.div>

        <div className="w-full mt-8 p-1 md:p-4">
          <motion.h1
            initial={{ opacity: 0, y: -120 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl md:text-4xl text-center my-2 md:my-4 dark:text-gray-300 font-bold leading-10 tracking-tight"
          >
            Features for a better experience.
          </motion.h1>

          <motion.div className="flex gap-1 items-center flex-wrap justify-around">
            {cardItems.map((item, index) => (
              <Card
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                color={item.color}
                delay={index * 0.1} // Add delay for staggered animation
              />
            ))}
          </motion.div>
          <AnimateSvg />
        </div>
        <Footer />
      </Scrollbar>
    </div>
  );
};

const Card = ({ icon, title, description, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`w-full sm:w-1/2 md:w-1/2 p-1 md:p-4`}
  >
    <div
      className={`rounded p-6 shadow-md text-${color}-500 duration-500 transition-all   hover:ring-2 hover:ring-yellow-500`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-4"
      >
        {icon}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-lg font-semibold mb-2"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-gray-500 text-sm"
      >
        {description}
      </motion.p>
    </div>
  </motion.div>
);

export default Home;
