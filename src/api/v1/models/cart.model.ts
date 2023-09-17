import { TypeOf, z } from "zod";
import { ItemResBodySchema } from "./item.model";
import { UserResBodySchema } from "./user.model";

export const CartSchema = z.object({
  cart_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
});

export const CartGetParamSchema = z.object({
  cart_id: z.string().uuid(),
});
export type CartGetParam = z.infer<typeof CartGetParamSchema>;

export const CartOutputSchema = CartSchema.omit({ user_id: true }).extend({
  items: z.array(ItemResBodySchema).nullish(),
  user: UserResBodySchema.nullish(),
});
export type CartResBody = z.infer<typeof CartOutputSchema>;

export const CartAddItemBodySchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().min(1),
});
export type CartAddItemBody = z.infer<typeof CartAddItemBodySchema>;

export const CartUpdateItemBodySchema = z.object({
  quantity: z.number().min(0),
});
export type CartUpdateItemBody = z.infer<typeof CartUpdateItemBodySchema>;

export const CartItemGetParamSchema = z.object({
  cart_id: z.string().uuid(),
  item_id: z.string().uuid(),
});
export type CartItemGetParam = z.infer<typeof CartItemGetParamSchema>;
