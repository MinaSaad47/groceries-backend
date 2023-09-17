import { NextFunction, Request, Response } from "express";
import { UserResBody, UserRole } from "@api/v1/models";
import passport from "passport";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user: UserResBody = res.locals.user;
    if (!roles.includes(user.role)) {
      return res.fail({
        code: 401,
        i18n: { key: "authorization.role", args: { role: user.role } },
      });
    }
    return next();
  };

export const requireJwt = passport.authenticate("jwt", { session: false });
