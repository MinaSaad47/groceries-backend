import { TypeOf, z } from "zod";
import { CategorySchema } from "./category.model";
import { BrandSchema } from "./brand.model";
import { ReviewSchema, ReviewWithUserOutputSchema } from "./review.model";

export const ItemSchema = z.object({
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string().nullish(),
  images: z.array(z.string()).nullish(),
  price: z.number().positive(),
  quantity: z.number(),
  quantity_type: z.string(),
});

// inputs

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateItemInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           default: 'Apple'
 *         description:
 *           type: string
 *           default: 'A good fruit'
 *         price:
 *           type: number
 *           default: 24
 *         quantity:
 *           type: number
 *           default: 1
 *         quantity_type:
 *           type: string
 *           default: 'KG'
 */
export const CreateItemInputSchema = ItemSchema;
export type CreateItemInput = TypeOf<typeof CreateItemInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateItemInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           default: 'Apple'
 *           nullable: true
 *         description:
 *           type: string
 *           default: 'A bad fruit'
 *           nullable: true
 *         price:
 *           type: number
 *           nullable: true
 *         offer_price:
 *           type: number
 *           nullable: true
 *         quantity:
 *           type: number
 *           nullable: true
 *         quantity_type:
 *           type: string
 *           nullable: true
 */
export const UpdateItemInputSchema = ItemSchema.extend({
  offer_price: z.number().positive().optional(),
}).partial();
export type UpdateItemInput = z.infer<typeof UpdateItemInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     GetItemInput:
 *       type: object
 *       required:
 *         - item_id
 *       properties:
 *         item_id:
 *           type: string
 *           format: uuid
 */
export const GetItemInputSchema = z.object({ item_id: z.string().uuid() });
export type GetItemInput = z.infer<typeof GetItemInputSchema>;

// outputs

/**
 * @openapi
 * components:
 *   schemas:
 *     ItemOutput:
 *       type: object
 *       properties:
 *         item_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         offer_price:
 *           type: number
 *           nullable: true
 *         quantity:
 *           type: number
 *         quantity_type:
 *           type: string
 *         brand:
 *           $ref: '#/components/schemas/BrandOutput'
 *         category:
 *           $ref: '#/components/schemas/CategoryOutput'
 *         images:
 *            type: array
 *            items:
 *              type: string
 */
export const ItemOutputSchema = ItemSchema.extend({
  item_id: z.string().uuid(),
  category: CategorySchema.nullish(),
  brand: BrandSchema.nullish(),
  offer_price: z.number().positive().nullish(),
  is_favorite: z.boolean().nullish(),
  images: z
    .array(z.string())
    .nullish()
    .transform((obj) => obj ?? []),
  reviews: z
    .array(ReviewWithUserOutputSchema)
    .nullish()
    .transform((obj) => obj ?? []),
}).omit({ brand_id: true, category_id: true });
export type ItemOutput = z.infer<typeof ItemOutputSchema>;
