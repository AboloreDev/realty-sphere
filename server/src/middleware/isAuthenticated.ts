import { Request, Response, NextFunction } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/httpStatus";
import AppErrorCode from "../constants/appErrorCode";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";

// Define the expected JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  role: "TENANT" | "LANDLORD";
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "TENANT" | "LANDLORD";
  };
}

export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the access token from cookies
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Unauthorized: No access token provided",
      AppErrorCode.InvalidAccessToken
    );

    // Verify and decode the JWT
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    appAssert(
      decoded.userId,
      UNAUTHORIZED,
      "Unauthorized: Invalid token payload",
      AppErrorCode.InvalidAccessToken
    );

    // Check for the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });
    appAssert(
      user,
      UNAUTHORIZED,
      "Unauthorized: User not found",
      AppErrorCode.InvalidAccessToken
    );

    // Attach user data to the request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as "TENANT" | "LANDLORD",
    };

    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return appAssert(
        false,
        UNAUTHORIZED,
        "Unauthorized: Invalid or expired token",
        AppErrorCode.InvalidAccessToken
      );
    }
    next(error);
  }
};
