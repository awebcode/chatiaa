import { Request } from "express";
import multer, { Multer, MulterError } from "multer";

// Define the storage configuration
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads"); // Set the destination folder
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    console.log({file})
    cb(null, `${Date.now() + "--chatapp-filename"}-${file.originalname}`); // Define the filename
  },
});

// Define the file filter function
// Define the file filter function
const fileFilter: any = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  // Check file types, for example, allow only images
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/x-icon"
  ) {
    cb(null, true); // Accept the file
  } else {
    console.log("Only images (jpeg, jpg, png,x-icon|ico) are allowed!", file);
    cb(new Error("Only images (jpeg, jpg, png,x-icon|ico) are allowed!"), false); // Reject the file
  
  }
};

// Set up multer with the storage configuration and file filter
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Specify fileSize as an object
});

export default uploadMiddleware;
