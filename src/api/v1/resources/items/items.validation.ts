import { items, reviews } from "@api/v1/db/schema";
import { faker } from "@faker-js/faker";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const CreateItemSchema = createInsertSchema(items)
  .omit({
    id: true,
    thumbnail: true,
  })
  .openapi("CreateItemSchema", {
    default: {
      name: faker.commerce.product(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      quantity: 30,
      quantityType: "KG",
    },
  });
export type CreateItem = z.infer<typeof CreateItemSchema>;

export const UpdateItemSchema =
  CreateItemSchema.partial().openapi("UpdateItemSchema");
export type UpdateItem = z.infer<typeof UpdateItemSchema>;

export const SelectItemSchema = z
  .object({
    itemId: z.string().uuid(),
  })
  .openapi("SelectItemSchema");
export type SelectItem = z.infer<typeof SelectItemSchema>;

export const CreateItemReviewSchema = createInsertSchema(reviews, {
  rating: (_) => z.number().min(1).max(5),
})
  .omit({ userId: true, itemId: true, createdAt: true })
  .openapi("CreateItemReviewSchema", {
    default: { rating: 3.4, comment: faker.lorem.paragraph() },
  });
export type CreateItemReview = z.infer<typeof CreateItemReviewSchema>;

export const UpdateItemReviewSchema = CreateItemReviewSchema.partial();
export type UpdateItemReview = z.infer<typeof UpdateItemReviewSchema>;
