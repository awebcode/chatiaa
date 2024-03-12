"use client";

import { Link } from "@/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const Error = () => {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");

  return (
    <div className="h-screen w-screen  flex items-center overflow-x-hidden">
      <div className="container flex flex-col md:flex-row items-center justify-between px-5 ">
        <div className="w-full lg:w-1/2 mx-8">
          <div className="text-5xl md:text-7xl text-green-500 font-dark font-extrabold mb-8">
            {" "}
            404
          </div>
          <h1>Something went wrong!</h1>
          <p className="text-2xl md:text-3xl    leading-normal mb-8">
            {error}
          </p>

          <Link
            href="/"
            className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl  transition-all duration-400 border border-transparent rounded-lg focus:outline-none bg-green-600 active:bg-red-600 hover:bg-red-700"
          >
            back to homepage
          </Link>
        </div>
        <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-5 my-12">
          <Image
            height={1000}
            width={1000}
            quality={100}
            loading="lazy"
            src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
            className="h-auto w-auto"
            alt="Page not found"
          />
        </div>
      </div>
    </div>
  );
};

export default Error;
