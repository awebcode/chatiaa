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

  const token = req.header("Authorization")?.split(" ")[1] || req.cookies.authToken;
  
  if (!token) {
    return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
  }

  try {
    console.log({ token })
    console.log({ secret: process.env.NEXTAUTH_SECRET! });
    
    // // Verify the token
    // const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    // console.log({decoded})
    // Attach the decoded data to the request for further use
    const decoded = await decode({
      token: token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    (req as any).id = decoded?.id;
console.log({decoded})
    next();
  } catch (error) {
    console.log({ authMiddleware: error });
    next(new CustomErrorHandler("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
