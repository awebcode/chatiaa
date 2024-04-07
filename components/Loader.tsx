import { BiLoaderCircle } from 'react-icons/bi';

const LoaderComponent = () => (
  <div className="p-5 flex flex-col items-center justify-center h-full">
    <div className="flex items-center gap-x-1">
      <BiLoaderCircle className="animate-spin h-5 w-5 md:h-7 md:w-7 text-blue-600 rounded-full relative" />
      <span className='text-[10px] md:text-xs animate-pulse'>Loading...</span>
    </div>
  </div>
);

export default LoaderComponent;
