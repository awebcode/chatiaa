
import { Link } from "@/navigation";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { BsShieldCheck } from "react-icons/bs";
import { FaLock, FaSave, FaVideo } from "react-icons/fa";
const Footer = dynamic(() => import("./Footer"));

const Home = () => {
  return (
    <div className="container mx-auto flex flex-wrap items-center justify-center h-screen">
      {/* Left side with text and button */}
      <div className="w-full md:w-1/2 p-4 flex flex-col items-start py-24 sm:py-0">
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
      <div className="w-full mt-8 p-2 md:p-4">
        <h1 className="text-3xl  md:text-4xl text-center my-2 md:my-4 dark:text-gray-300  font-bold leading-10 tracking-tight">
          Features for a better experience.
        </h1>
        <div className="flex flex-wrap justify-center">
          {/* Card 1 */}
          <Card
            icon={<ChatBubbleIcon className="w-8 h-8 text-blue-500 mb-4" />}
            heading="Chat App"
            description="Start chatting with your friends in real-time."
          />

          {/* Card 2 */}
          <Card
            icon={<BsShieldCheck className="w-8 h-8 text-blue-500 mb-4" />}
            heading="Keep Private"
            description="Your conversations are secure and private."
          />

          {/* Card 3 */}
          <Card
            icon={<FaSave className="w-8 h-8 text-blue-500 mb-4" />}
            heading="Save Time"
            description="Efficient communication, saving you valuable time."
          />

          {/* Card 4 */}
          <Card
            icon={<FaVideo className="w-8 h-8 text-blue-500 mb-4" />}
            heading="Audio/Video/Voice Chat"
            description="Connect with others through high-quality audio/video/group calls."
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Card = ({ icon, heading, description }: any) => (
  <div className="w-full sm:w-1/2 md:w-1/4 p-4">
    <div className="dark:bg-gray-800 rounded p-6 shadow-md">
      <div className="text-blue-500 mb-4">{icon}</div>
      <h2 className="text-lg font-semibold mb-2">{heading}</h2>
      <p className="text-gray-500">{description}</p>
    </div>
  </div>
);

export default Home;
