import { Request, Response } from "express";
import { UserOutput } from "@api/v1/models";
import { generateJwt } from "../utils/auth.utils";
import logger from "../utils/logger";

export const login = async (req: Request, res: Response) => {
  const user = req.user as UserOutput;
  logger.debug("user with id", user.user_id, "is logging");
  const token = generateJwt(user);
  logger.debug("user with id is aquiring an access token");
  res.cookie("x-auth-cookie", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  res.status(200).json({ token, user });
};
