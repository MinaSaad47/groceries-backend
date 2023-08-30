import { z } from "zod";
import { TimestampSchema } from "./timestamp.model";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export const UserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole).default(UserRole.User),
});

// inputs
export const CreateUserInputSchema = UserSchema;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = UserSchema.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export const GetUserInputSchema = z.object({ user_id: z.string().uuid() });
export type GetUserInput = z.infer<typeof GetUserInputSchema>;

// outputs
export const UserOutputSchema = UserSchema.extend({
  user_id: z.string().uuid(),
});
export type UserOutput = z.infer<typeof UserOutputSchema>;
