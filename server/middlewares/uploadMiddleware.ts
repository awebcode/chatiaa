import { Request } from "express";
import multer, { Multer, MulterError } from "multer";

// Define the storage configuration
const storage = multer.diskStorage({
  destination: (
    req: Request | any,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads"); // Set the destination folder
  },
  filename: (
    req: Request | any,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now() + "Chatiaa_files"}-${file.originalname}`); // Define the filename
  },
});

// Define the file filter function
// Define the file filter function
const fileFilter: any = (
  req: Request | any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  // Check file types, for example, allow only images
  cb(null, true); // Accept the file
};

// Set up multer with the storage configuration and file filter
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1000 * 1024 * 1024 }, // Specify fileSize as an object
});

export default uploadMiddleware;
