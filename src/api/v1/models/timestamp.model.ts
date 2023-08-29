import { z } from "zod";

export const TimestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
