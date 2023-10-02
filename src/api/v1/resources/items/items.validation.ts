import { items, itemsTrans, reviews } from "@api/v1/db/schema";
import { faker } from "@faker-js/faker";
import { ilike } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const CreateItemSchema = createInsertSchema(items)
  .omit({
    id: true,
    thumbnail: true,
  })
  .extend({ name: z.string(), description: z.string() })
  .openapi("CreateItemSchema", {
    default: {
      name: faker.commerce.product(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      qty: 30,
      qtyType: "1KG",
    },
  });
export type CreateItem = z.infer<typeof CreateItemSchema>;

const DetailsSchema = z.object({
  lang: z.enum(["en", "ar"]),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateItemSchema = createInsertSchema(items)
  .extend({
    details: z.array(
      z.object({
        lang: z.enum(["en", "ar"]),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    ),
  })
  .partial()
  .openapi("UpdateItemSchema", {
    default: {
      details: [
        {
          lang: "ar",
          description: "وصف",
          name: "اسم",
        },
      ],
      price: parseFloat(faker.commerce.price()),
      qty: 30,
      qtyType: "1KG",
    },
  });
export type UpdateItem = z.infer<typeof UpdateItemSchema>;

export const SelectItemSchema = z
  .object({
    itemId: z.string().uuid(),
  })
  .openapi("SelectItemSchema");
export type SelectItem = z.infer<typeof SelectItemSchema>;

export const QueryLangSchema = z.object({
  lang: z.enum(["en", "ar"]).default("en"),
});
export type QueryLang = z.infer<typeof QueryLangSchema>;

export const QueryItemsSchema = z
  .object({
    lang: z.enum(["en", "ar"]).default("en"),
    q: z.string().optional(),
    orderBy: z
      .preprocess(
        (val) => String(val).split(","),
        z.array(z.enum(["price", "qty", "rating", "orderCount"]))
      )
      .optional(),
    page: z.undefined({
      invalid_type_error: "both perPage & page must be defined",
    }),
    perPage: z.undefined({
      invalid_type_error: "both perPage & page must be defined",
    }),
  })
  .or(
    z.object({
      lang: z.enum(["en", "ar"]).default("en"),
      q: z.string().optional(),
      orderBy: z
        .preprocess(
          (val) => String(val).split(","),
          z.array(z.enum(["price", "qty", "rating", "orderCount"]))
        )
        .optional(),
      page: z.number({ coerce: true }).int().positive(),
      perPage: z.number({ coerce: true }).int().positive(),
    })
  )
  .transform(({ lang, q, page, perPage, orderBy }) => ({
    ...(page && perPage && { offset: (page - 1) * perPage, limit: perPage }),
    ...(q && { where: ilike(itemsTrans.name, `%${q}%`) }),
    orderBy,
    lang,
  }));

export type QueryItems = z.infer<typeof QueryItemsSchema>;

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
