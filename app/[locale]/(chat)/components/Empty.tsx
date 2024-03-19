import React from "react";

const EmptyChat = () => {
  return (
    <div>
      <main className="h-[88vh] w-full rounded flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl md:text-5xl font-extrabold  tracking-widest">Empty!</h1>
        {/* <div className="bg-[#FF6A3D] px-2 text-sm rounded rotate-12 absolute">
          Select A Chat To Continue!
        </div> */}
        <button className="mt-5">
          <a className="relative inline-block text-sm font-medium text-[#FF6A3D] group active:text-orange-500 focus:outline-none focus:ring">
            <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0"></span>
          </a>
        </button>
      </main>
    </div>
  );
};

export default EmptyChat;
