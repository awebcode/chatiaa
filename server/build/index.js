"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const connectDb_1 = __importDefault(require("./config/connectDb"));
const cloudinaryConfig_1 = __importDefault(require("./config/cloudinaryConfig"));
const dotenv_1 = require("dotenv");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
//?socketIO cluster modules
const initSocketIO_1 = require("./common/initSocketIO");
const socket_1 = require("./socket");
exports.io = (0, initSocketIO_1.getIoInstance)();
(0, connectDb_1.default)();
(0, cloudinaryConfig_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const corsOptions = {
    origin: ["http://localhost:3000", "https://chatiaa.vercel.app"], // Allow requests from this specific origin
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", authRoutes_1.default);
app.use("/api/v1", chatRoutes_1.default);
app.use("/api/v1", messageRoutes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
//*socketIO related logics
(0, socket_1.socketINIT)(app);
