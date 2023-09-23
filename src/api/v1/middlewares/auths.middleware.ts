import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { UserRole } from "../db/schema";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    if (!roles.includes(user.role || "user")) {
      return res.fail({
        code: 401,
        i18n: { key: "authorization.role", args: { role: user.role } },
      });
    }
    return next();
  };

export const requireJwt = passport.authenticate("jwt", { session: false });
