import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload, isUserActive } from "../utils/jwt";
import { sendError } from "../utils/response";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "No token provided", 401);
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    const isActive = await isUserActive(payload.userId);

    if (!isActive) {
      throw new Error("User Not Active");
    }

    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      sendError(res, "Token expired", 401);
      return;
    }
    if (error.name === "JsonWebTokenError") {
      sendError(res, "Invalid token", 401);
      return;
    }
    sendError(res, "Authentication failed", 401);
  }
};
