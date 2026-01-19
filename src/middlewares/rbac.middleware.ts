import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export type RoleName =
  | "USER"
  | "ADMIN"
  | "MANAGER"
  | "SALES"
  | "SALES_MANAGER"
  | "VOLT"
  | "VOLT_MANAGER"
  | "RH"
  | "ACCOUNTANT";

export const requireRole = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }

    next();
  };
};
