import { UserOutput } from "../models";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

export const generateJwt = (user: UserOutput) => {
  const token = jwt.sign(
    {
      expiresIn: "12h",
      id: user.user_id,
    },
    secretOrKey!
  );
  return token;
};
