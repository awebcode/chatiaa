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
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
const ThemeButton = dynamic(() => import("./ThemeButton"));

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const logoutHandler = async () => {
    const res: any = await signOut();

    if (res?.ok) router.push("/");
  };
 
  return (
    <nav className="sticky flex items-center justify-between p-4 px-10  shadow-sm">
      {/* Left Side - Logo */}
      <div
        className="flex items-center space-x-4 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <Image height={32} width={32} src="/logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="text-xl font-semibold">Messengaria</span>
      </div>

      {/* Right Side - Sign In/Profile */}
      <div className="flex items-center space-x-4">
        <ThemeButton />
        {session&&session?.user ? (
          // If user is authenticated, display profile image
          <DropdownMenu>
            <DropdownMenuTrigger className="border-none outline-none">
              <div className="flex items-center space-x-2 cursor-pointer">
                {session?.user.image?.includes("accessoriesType") ? (
                  <img
                    height={32}
                    width={32}
                    src={session?.user?.image || "/logo.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    height={32}
                    width={32}
                    src={session?.user?.image || "/logo.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span>{session?.user?.name}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/profile"}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
              <DropdownMenuItem onClick={logoutHandler}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // If user is not authenticated, display sign-in link
          <Link href="/login">
            <p className="">Sign In</p>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
