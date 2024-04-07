import { BiLoaderCircle } from 'react-icons/bi';

const LoaderComponent = () => (
  <div className="p-4 flex flex-col items-center justify-center h-full">
    <div className="flex items-center gap-x-1">
      <BiLoaderCircle className="animate-spin h-8 w-8 text-blue-600 rounded-full relative" />
      <span className='animate-pulse'>Loading...</span>
    </div>
  </div>
);

export default LoaderComponent;
