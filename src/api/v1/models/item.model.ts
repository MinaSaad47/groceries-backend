import { TypeOf, z } from "zod";
import { TimestampSchema } from "./timestamp.model";
import { CategorySchema } from "./category.model";
import { BrandSchema } from "./brand.model";

export const ItemSchema = z.object({
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
});

// inputs
export const CreateItemInputSchema = ItemSchema;
export type CreateItemInput = TypeOf<typeof CreateItemInputSchema>;

export const UpdateItemInputSchema = ItemSchema.partial();
export type UpdateItemInput = z.infer<typeof UpdateItemInputSchema>;

export const GetItemInputSchema = z.object({ item_id: z.string().uuid() });
export type GetItemInput = z.infer<typeof GetItemInputSchema>;

// outputs
export const ItemOutputSchema = ItemSchema.extend({
  item_id: z.string().uuid(),
  category: CategorySchema.nullish(),
  brand: BrandSchema.nullish(),
  is_favorite: z.boolean().optional(),
}).omit({ brand_id: true, category_id: true });
export type ItemOutput = z.infer<typeof ItemOutputSchema>;
