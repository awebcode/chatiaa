import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "./errorHandler";
import { decode } from "next-auth/jwt"; //for decoding next-auth_session_token
import { getServerSession } from "next-auth/next";
import { serverAuthOptions } from "../config/serverAuthOptions";
import { getToken } from "next-auth/jwt";
interface AuthenticatedRequest extends Request {
  id: number | string;
}
const authMiddleware: any = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    // const session = await getServerSession(req, res, serverAuthOptions); //i can access more data using it like name,email,role,etc what i will provide on serverAuthOptions>session callback
    const decoded = await decode({
      token: req.cookies.authToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token?.email && !decoded?.sub) {
      return next(new CustomErrorHandler("Unauthorized -Plese login and continue", 401));
    }

    //  console.log({decoded, token, session, authToken: req.cookies.authToken });

    if (decoded) {
      //it will needed when will access  data by server side next js
      (req as any).id = decoded?.id;
      next();
    } else if (token?.email) {
      (req as any).id = token?.id;
      next();
    }
  } catch (error) {
    console.log({ authMiddleware: error });
   return next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
