import { z } from "zod";

export const TimestampSchema = z.object({
  created_at: z.date(),
  updated_at: z.date(),
});
