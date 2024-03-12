import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";

const Profile = async () => {
  const data = await getServerSession(authOptions);
  if (!data?.user) {
     
    // If there is no authenticated session, you can redirect the user to the login page.
     return redirect("/");
    }
    const { user } = data;

  return (
    <div className="container mx-auto flex items-center justify-center h-[60vh]">
      <div className="flex flex-col p-8 rounded-lg shadow-md max-w-lg">
        <h1 className="text-2xl font-semibold mb-4">{user?.name}'s Profile</h1>
        <div className="flex items-center space-x-4">
          {user.image?.includes("accessoriesType") ? (
            <img
              height={48}
              width={48}
              src={user?.image || "/logo.svg"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <Image
              height={48}
              width={48}
              src={user?.image || "/logo.svg"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-lg font-semibold">{(user as any)?.id}</p>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
