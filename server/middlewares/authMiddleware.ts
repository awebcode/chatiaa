import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "./errorHandler";
import { decode } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import { serverAuthOptions } from "../config/serverAuthOptions";
interface AuthenticatedRequest extends Request {
  id: number | string;
}
const authMiddleware: any = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await getServerSession(req, res, serverAuthOptions);

    if (session && session.user) {
      console.log({ session: (session as any).user.id });
    }
    if (session && session.user) {
   (req as any).id = (session as any).user?.id;
   }

    next();
  } catch (error) {
    console.log({ authMiddleware: error });
    next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
