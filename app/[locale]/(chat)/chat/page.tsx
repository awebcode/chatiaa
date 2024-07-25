
import { fetchUser } from "@/apisActions/serverActions";
import { redirect } from "@/navigation";
import ClientMessages from "./ClientMessages";

const page = async () => {
  const user = await fetchUser();
  if (!user?.email) return redirect("/");
  return (
    <>
     <ClientMessages/>
    </>
  );
};

export default page;
