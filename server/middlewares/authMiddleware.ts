import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomErrorHandler } from "./errorHandler";
import { User } from "../model/UserModel";
import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";
interface AuthenticatedRequest extends Request {
  id: number | string;
}
const authMiddleware: any = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  const token = req.header("Authorization")?.split(" ")[1] || req.cookies.authToken;
  
  if (!token) {
    return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
  }

  try {
    // // Verify the token
    // const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    // console.log({decoded})
    // Attach the decoded data to the request for further use
    const decoded = await decode({
      token: token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    (req as any).id = decoded?.id;

    next();
  } catch (error) {
    console.log({ authMiddleware: error });
    next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
