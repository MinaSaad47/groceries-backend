import { TypeOf, z } from "zod";
import { TimestampSchema } from "./timestamp.model";

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

export const GetItemInputSchema = z.object({ itemId: z.string().uuid() });
export type GetItemInput = z.infer<typeof GetItemInputSchema>;

// outputs
export const ItemOutputSchema = ItemSchema.merge(TimestampSchema);
export type ItemOutput = z.infer<typeof ItemOutputSchema>;
