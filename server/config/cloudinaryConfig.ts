import { v2 } from "cloudinary";

const cloudinaryConfig = () => {
  v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
};

export default cloudinaryConfig;
