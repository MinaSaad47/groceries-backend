import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UsersService } from "../users.service";
import { Request } from "express";

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
    async (payload, done) => {
      const user = await UsersService.getOne(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    }
  )
);
