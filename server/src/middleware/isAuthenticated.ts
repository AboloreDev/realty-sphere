// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/httpStatus";
import AppErrorCode from "../constants/appErrorCode";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";

interface JwtPayload {
  userId: string;
  email: string;
  role: "TENANT" | "MANAGER";
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: "TENANT" | "MANAGER" };
}

export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Unauthorized: No access token provided",
      AppErrorCode.InvalidAccessToken
    );

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

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as "TENANT" | "MANAGER",
    };

    next();
  } catch (error) {
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

export const restrictTo = (role: "TENANT" | "MANAGER") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return appAssert(
        false,
        FORBIDDEN,
        `Access denied: ${role} role required`,
        AppErrorCode.UnauthorizedRole
      );
    }
    next();
  };
};
