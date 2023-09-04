import { TypeOf, z } from "zod";
import { ItemOutputSchema } from "./item.model";

export const CartSchema = z.object({
  cart_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
});

export const CartOutputSchema = CartSchema.extend({
  items: z.array(ItemOutputSchema).nullish(),
});
export type CartOutput = z.infer<typeof CartOutputSchema>;
