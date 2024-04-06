"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/navigation";
import { AvatarIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { CiLogout } from "react-icons/ci";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiUsers } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
const ThemeButton = dynamic(() => import("./ThemeButton"));
const LanguageChanger = dynamic(() => import("./LanguageChanger"));
const Navbar = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const { data: session } = useSession();
  const router = useRouter();

  const logoutHandler = async () => {
    await signOut();
    queryClient.invalidateQueries({ queryKey: ["fetch-server-user"] });

    localStorage.removeItem("currentUser");
    router.push("/");
  };
  return (
    <nav className="sticky flex items-center justify-between p-3 md:p-4 px-4 md:px-10  shadow-sm">
      {/* Left Side - Logo */}
      <div
        className="flex items-center space-x-4 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <Image
          height={32}
          width={32}
          src="/logo.svg"
          alt="Logo"
          className="w-6 h-6 md:w-8 md:h-8"
        />

        <span className="hidden md:block text-sm md:text-xl font-semibold">
          {t("logo")}
        </span>
      </div>

      {/* Right Side - Sign In/Profile */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <ThemeButton />
          <LanguageChanger />
        </div>
        {session && session?.user ? (
          // If user is authenticated, display profile image
          <DropdownMenu>
            <DropdownMenuTrigger className="border-none outline-none">
              <div className=" flex flex-col items-center space-x-2 cursor-pointer">
               <div className="relative">
                 <Image
                  height={32}
                  width={32}
                  src={session?.user?.image || "/logo.svg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 rounded-full  p-[5px] 
                 bg-green-500 
                `}
                ></span>
               </div>
                <span className="text-gray-400 text-xs">{session?.user?.name}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/profile"} className="flex gap-2">
                  <AvatarIcon className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/chat"} className="flex gap-2">
                  <ChatBubbleIcon className="h-4 w-4" />
                  chat
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className={`${
                  (session?.user as any)?.role === "admin" ? "block" : "hidden"
                }`}
              >
                <Link href={"/users"} className="flex gap-2">
                  <FiUsers className="h-4 w-4" />
                  users
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logoutHandler}
                className="flex gap-2 text-red-500"
              >
                <CiLogout className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // If user is not authenticated, display sign-in link
          <Link href="/login">
            <p className="text-sm font-font-medium">{t("navigations.Login")}</p>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
