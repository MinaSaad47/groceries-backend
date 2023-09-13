import { TypeOf, z } from "zod";
import { UserOutputSchema } from "./user.model";
import { ItemOutputSchema } from "./item.model";

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// inputs
export const CreateReviewInputSchema = ReviewSchema;
export type CreateReviewInput = TypeOf<typeof CreateReviewInputSchema>;

export const GetReviewInputSchema = z.object({ review_id: z.string().uuid() });
export type GetReviewInput = TypeOf<typeof GetReviewInputSchema>;

// outputs
export const ReviewOutputSchema = ReviewSchema.extend({
  review_id: z.string().uuid(),
});
export type ReviewOutput = z.infer<typeof ReviewOutputSchema>;

export const ReviewWithUserOutputSchema = ReviewOutputSchema.extend({
  user: UserOutputSchema,
});
export type ReviewWithUserOutput = z.infer<typeof ReviewWithUserOutputSchema>;
