import { faker } from "@faker-js/faker";
import { z } from "zod";

export const CreateProfileFavoriteSchema = z
  .object({ itemId: z.string().uuid() })
  .openapi("CreateProfileFavoriteSchema", {
    default: { itemId: faker.string.uuid() },
  });
export type CreateProfileFavorite = z.infer<typeof CreateProfileFavoriteSchema>;

export const SelectProfileFavoriteSchema = z
  .object({ itemId: z.string().uuid() })
  .openapi("SelectProfileFavoriteSchema", {
    default: { itemId: faker.string.uuid() },
  });
export type SelectProfileFavorite = z.infer<typeof SelectProfileFavoriteSchema>;
