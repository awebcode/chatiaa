// server.ts
import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import connectDb from "./config/connectDb";
import cloudinaryConfig from "./config/cloudinaryConfig";
import { config } from "dotenv";
import authRoute from "./routes/authRoutes";
import chatRoute from "./routes/chatRoutes";
import messageRoute from "./routes/messageRoutes";
import cookieParser from "cookie-parser";
config();

const app = express();
//?socketIO cluster modules
import { getIoInstance } from "./common/initSocketIO";
import { socketINIT } from "./socket";
export const io = getIoInstance();
connectDb();
cloudinaryConfig();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const corsOptions = {
  origin: ["http://localhost:3000", "https://chatiaa.vercel.app"], // Allow requests from this specific origin
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api/v1", authRoute);
app.use("/api/v1", chatRoute);

app.use("/api/v1", messageRoute);
app.use(notFoundHandler);
app.use(errorHandler);


//*socketIO related logics
socketINIT(app)