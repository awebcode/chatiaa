import { BiLoaderCircle } from "react-icons/bi";

const LoaderComponent = ({
  text,
  color,
  size,
}: {
  text?: string;
  color?: string;
  size?: string;
}) => (
  <div className="p-5 flex flex-col items-center justify-center h-full">
    <div className="flex items-center gap-x-1">
      <BiLoaderCircle className={`animate-spin h-${size||5} w-${size||5} md:h-${size||7} md:w-${size||7} text-emerald-600 rounded-full relative`} />
      <span className="text-[10px] md:text-xs animate-pulse">{text || "Loading..."}</span>
    </div>
  </div>
);

export default LoaderComponent;
