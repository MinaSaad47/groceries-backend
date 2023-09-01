import { NextFunction, Request, Response } from "express";
import { UserOutput, UserRole } from "@api/v1/models";
import passport from "passport";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user: UserOutput = res.locals.user;
    if (!roles.includes(user.role)) {
      return res.status(401).send("Unauthorized to access this route");
    }
    return next();
  };

export const requireJwt = passport.authenticate("jwt", { session: false });
