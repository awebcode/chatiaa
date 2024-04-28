
import { fetchUser } from "@/apisActions/serverActions";
import { redirect } from "@/navigation";
import ClientMessages from "./ClientMessages";

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const user = await fetchUser();
  if (!user?.email) return redirect("/");
  return (
    <>
     <ClientMessages/>
    </>
  );
};

export default page;
