import { TypeOf, z } from "zod";

export const BrandSchema = z.object({
  brand_id: z.string().uuid().optional(),
  name: z.string(),
});

// inputs
export const CreateBrandInputSchema = BrandSchema;
export type CreateBrandInput = TypeOf<typeof CreateBrandInputSchema>;

export const UpdateBrandInputSchema = BrandSchema.partial();
export type UpdateBrandInput = z.infer<typeof UpdateBrandInputSchema>;

export const GetBrandInputSchema = z.object({ brand_id: z.string().uuid() });
export type GetBrandInput = z.infer<typeof GetBrandInputSchema>;

// outputs
export const BrandOutputSchema = BrandSchema.extend({
  brand_id: z.string().uuid(),
});
export type BrandOutput = z.infer<typeof BrandOutputSchema>;
