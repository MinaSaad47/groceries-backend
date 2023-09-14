import { TypeOf, z } from "zod";

export const CategorySchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string(),
  image: z.string().optional(),
});

// inputs

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateCategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 */
export const CreateCategoryInputSchema = CategorySchema;
export type CreateCategoryInput = TypeOf<typeof CreateCategoryInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 */
export const UpdateCategoryInputSchema = CategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     GetCategoryInput:
 *       type: object
 *       required:
 *         - category_id
 *       properties:
 *         category_id:
 *           type: string
 *           format: uuid
 */
export const GetCategoryInputSchema = z.object({
  category_id: z.string().uuid(),
});
export type GetCategoryInput = z.infer<typeof GetCategoryInputSchema>;

// outputs

/**
 * @openapi
 * components:
 *   schemas:
 *     CategoryOutput:
 *       type: object
 *       properties:
 *         category_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 */
export const CategoryOutputSchema = CategorySchema.extend({
  category_id: z.string().uuid(),
});
export type CategoryOutput = z.infer<typeof CategoryOutputSchema>;
