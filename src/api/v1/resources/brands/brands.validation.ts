import { createInsertSchema } from "drizzle-zod";
import { brands, categories } from "../../db/schema";
import { z } from "zod";
import { faker } from "@faker-js/faker";

export const CreateBrandSchema = createInsertSchema(brands)
  .omit({
    id: true,
  })
  .openapi("CreateBrandShema", { default: { name: faker.company.name() } });
export type CreateBrand = z.infer<typeof CreateBrandSchema>;

export const UpdateBrandSchema = CreateBrandSchema.partial().openapi(
  "UpdateBrandSchema",
  { default: { name: faker.company.name() } }
);
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;

export const SelectBrandSchema = z
  .object({ brandId: z.string().uuid() })
  .openapi("SelectBrandSchema", {
    default: { brandId: faker.string.uuid() },
  });
export type SelectBrand = z.infer<typeof SelectBrandSchema>;
