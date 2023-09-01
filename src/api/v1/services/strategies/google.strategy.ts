import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { UsersService } from "../users.service";
import { Request } from "express";
import { UserSchema } from "@api/v1/models";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) => {
      let user = await UsersService.findByEmail(profile.email);
      if (user) {
        return done(null, user);
      }
      user = await UsersService.createOne(
        UserSchema.parse({
          username: `user${profile.id}`,
          email: profile.email,
        })
      );
      done(null, user);
    }
  )
);
