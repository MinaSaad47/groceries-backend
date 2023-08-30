import { TypeOf, z } from "zod";
import { TimestampSchema } from "./timestamp.model";

export const CategorySchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string(),
});

// inputs
export const CreateCategoryInputSchema = CategorySchema;
export type CreateCategoryInput = TypeOf<typeof CreateCategoryInputSchema>;

export const UpdateCategoryInputSchema = CategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;

export const GetCategoryInputSchema = z.object({
  category_id: z.string().uuid(),
});
export type GetCategoryInput = z.infer<typeof GetCategoryInputSchema>;

// outputs
export const CategoryOutputSchema = CategorySchema.extend({
  category_id: z.string().uuid(),
});
export type CategoryOutput = z.infer<typeof CategoryOutputSchema>;
