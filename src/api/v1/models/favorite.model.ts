import { z } from "zod";

export const CreateFavoriteSchema = z.object({ item_id: z.string().uuid() });
export type CreateFavoriteInput = z.infer<typeof CreateFavoriteSchema>;

export const DeleteFavoriteSchema = CreateFavoriteSchema;
export type DeleteFavoriteInput = z.infer<typeof DeleteFavoriteSchema>;