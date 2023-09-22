import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { Request } from "express";
import { db } from "@api/v1/db";
import { eq } from "drizzle-orm";
import { users } from "@api/v1/db/schema";
import log from "@api/v1/utils/logger";

const isProduction = process.env.NODE_ENV === "production";
const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

function cookieExtractor(req: Request) {
  var token = null;

  if (req && req.cookies) {
    token = req.signedCookies["x-auth-cookie"];
  }
  return token;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey,
    },
    async (payload: any, done: VerifiedCallback) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.id),
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    }
  )
);
