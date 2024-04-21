import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "./errorHandler";
import { decode } from "next-auth/jwt"; //for decoding next-auth_session_token
import { getServerSession, unstable_getServerSession } from "next-auth/next";
import { serverAuthOptions } from "../config/serverAuthOptions";
import { getToken } from "next-auth/jwt";
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
const authMiddleware: any = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    const session = await getServerSession(req, res, serverAuthOptions); //i can access more data using it like name,email,role,etc what i will provide on serverAuthOptions>session callback
    const authToken =
      req.cookies.authToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    
    let decoded: any;
    // // console.log({ authToken, secret: process.env.NEXTAUTH_SECRET! });

    if (authToken) {
      if (authToken === "undefined") {
        return next(new CustomErrorHandler("Unauthorized -No token provided", 401));
      }
      decoded = await decode({
        token: authToken,
        secret: process.env.NEXTAUTH_SECRET!,
      });
    }

    if (!session?.user?.email && !decoded?.sub) {
      return next(new CustomErrorHandler("Unauthorized -Plese login and continue", 401));
    }

    req.id = (session as any)?.user?.id ? (session as any)?.user?.id : decoded?.sub;
    next();
  } catch (error) {
    console.log({ authMiddleware: error });
    return next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
