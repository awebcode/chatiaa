import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomErrorHandler } from "./errorHandler";
import { User } from "../model/UserModel";

interface AuthenticatedRequest extends Request {
  id: number | string;
}
const authMiddleware: any = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1] || req.cookies.authToken;
  // console.log()
  // console.log({token})
  if (!token) {
    return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
  }

  try {
    // Verify the token
    const decoded: any = jwt.verify(token, "your-secret-key");

    // Attach the decoded data to the request for further use

    req.id = decoded.id;

    next();
  } catch (error) {
    console.log({ authMiddleware: error });
    next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
