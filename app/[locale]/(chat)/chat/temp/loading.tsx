import { BiLoaderCircle } from "react-icons/bi";

const LoaderComponent = () => (
  <div className="p-5 flex flex-col items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-x-1">
      <BiLoaderCircle
        className={`animate-spin h-7 w-7 md:h-10 md:w-10 text-emerald-600 rounded-full relative`}
      />
      <span className="text-xl md:text-2xl animate-pulse">Chatiaa</span>
    </div>
  </div>
);

export default LoaderComponent;
