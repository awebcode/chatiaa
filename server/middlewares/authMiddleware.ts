import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "./errorHandler";
import { decode } from "next-auth/jwt";
interface AuthenticatedRequest extends Request {
  id: number | string;
}
const authMiddleware: any = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.header("Authorization")?.split(" ")[1] ||
    req.cookies.authToken ||
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"];
  console.log({token})
  if (token === "undefined") {
    return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
  }
  if (!token) {
    return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
  }
  try {
    const decoded = await decode({
      token,
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
