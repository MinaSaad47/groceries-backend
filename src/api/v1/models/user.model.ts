import { z } from "zod";
import { TimestampSchema } from "./timestamp.model";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export const UserSchema = z.object({
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  email: z.string().email(),
  phone_number: z.string().nullish(),
  profile_picture: z.string().nullish(),
  role: z.nativeEnum(UserRole).default(UserRole.User),
});

// inputs
export const UserCreateBodySchema = UserSchema;
export type UserCreateBody = z.infer<typeof UserCreateBodySchema>;

export const UserUpdateBodySchema = UserSchema.partial();
export type UserUpdateBody = z.infer<typeof UserUpdateBodySchema>;

export const UserGetParamSchema = z.object({ user_id: z.string().uuid() });
export type UserGetParam = z.infer<typeof UserGetParamSchema>;

// outputs
export const UserResBodySchema = UserSchema.extend({
  user_id: z.string().uuid(),
});
export type UserResBody = z.infer<typeof UserResBodySchema>;
