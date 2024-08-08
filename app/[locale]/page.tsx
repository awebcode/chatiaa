import Home from "@/components/Home";
import dynamic from "next/dynamic";

// const Home = dynamic(() => import("../../components/Home"),{ssr:false});
export const maxDuration=60
export default async function MainPage() {
  return (
    <div className="">
      
      <Home />
      {/* <Footer/> */}
    </div>
  );
}
