import { carts, cartsToItems } from "@api/v1/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const SelectCartSchema = z.object({cartId: z.string().uuid()})
export type SelectCart = z.infer<typeof SelectCartSchema>;

const CartToItemSchema = createInsertSchema(cartsToItems, {
  cartId: (schema) => schema.cartId.uuid(),
  itemId: (schema) => schema.itemId.uuid(),
  quantity: (_) => z.number().min(0),
});

export const CreateCartToItemSchema = CartToItemSchema.omit({
  cartId: true,
});
export type CreateCartToItem = z.infer<typeof CreateCartToItemSchema>;

export const SelectCartToItemSchema = CartToItemSchema.omit({
  quantity: true,
});
export type SelectCartToItem = z.infer<typeof SelectCartToItemSchema>;
