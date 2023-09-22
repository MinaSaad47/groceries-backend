import jwt from "jsonwebtoken";
import { User } from "../resources/users/users.type";

const isProduction = process.env.NODE_ENV === "production";

const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

export const generateJwt = (user: User) => {
  const token = jwt.sign(
    {
      expiresIn: "12h",
      id: user.id,
    },
    secretOrKey!
  );
  return token;
};
