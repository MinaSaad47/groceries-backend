import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { Request } from "express";
import { CreateUserSchema } from "@api/v1/resources/users/users.validation";
import { db } from "@api/v1/db";
import { eq } from "drizzle-orm";
import { users } from "@api/v1/db/schema";

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
      let user = await db.query.users.findFirst({
        where: eq(users.email, profile.email),
      });
      if (user) {
        return done(null, user);
      }
      [user] = await db
        .insert(users)
        .values(
          CreateUserSchema.parse({
            email: profile.email,
          })
        )
        .returning();
      done(null, user);
    }
  )
);
