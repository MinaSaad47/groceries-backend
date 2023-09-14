import { TypeOf, z } from "zod";

export const BrandSchema = z.object({
  brand_id: z.string().uuid().optional(),
  name: z.string(),
});

// inputs

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateBrandInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 */
export const CreateBrandInputSchema = BrandSchema;
export type CreateBrandInput = TypeOf<typeof CreateBrandInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateBrandInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 */
export const UpdateBrandInputSchema = BrandSchema.partial();
export type UpdateBrandInput = z.infer<typeof UpdateBrandInputSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     GetBrandInput:
 *       type: object
 *       required:
 *         - brand_id
 *       properties:
 *         brand_id:
 *           type: string
 *           format: uuid
 */
export const GetBrandInputSchema = z.object({ brand_id: z.string().uuid() });
export type GetBrandInput = z.infer<typeof GetBrandInputSchema>;

// outputs

/**
 * @openapi
 * components:
 *   schemas:
 *     BrandOutput:
 *       type: object
 *       properties:
 *         brand_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 */
export const BrandOutputSchema = BrandSchema.extend({
  brand_id: z.string().uuid(),
});
export type BrandOutput = z.infer<typeof BrandOutputSchema>;
