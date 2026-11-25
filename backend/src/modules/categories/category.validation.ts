import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),

  description: z.string().trim().max(500).optional(),
}).strict();

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Au moins un champ est obligatoire."
  );

export type CreateCategoryInput =
  z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput =
  z.infer<typeof updateCategorySchema>;