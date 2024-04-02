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
  console.log("Headers:", req.headers); // Log headers to check Authorization header
  console.log("Cookies:", req.cookies); // Log cookies to check authToken and other relevant cookies
  console.log("NODE_ENV:", process.env.NODE_ENV); // Log NODE_ENV to ensure it's set correctly
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET); // Log NEXTAUTH_SECRET to ensure it's set correctly
  console.log("Token:", JSON.stringify(req.headers.token)); // Log the token object as a string
  console.log("Cookies:", JSON.stringify(req.cookies)); // Log cookies to check authToken and other relevant cookies

  const token =
    // req.header("Authorization")?.split(" ")[1] ||
    req.cookies.authToken ||
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"];

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
