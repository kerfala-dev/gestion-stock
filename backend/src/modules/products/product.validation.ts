import { z } from "zod";

const priceSchema = z
  .number()
  .finite()
  .min(0)
  .max(999_999_999.99)
  .refine(
    (value) => Number.isInteger(value * 100),
    "Le prix ne doit pas dépasser deux décimales."
  );

export const createProductSchema = z.object({
  sku: z.string().trim().min(1).max(50),

  name: z.string().trim().min(2).max(120),

  description: z.string().trim().max(1000).optional(),

  categoryId: z.string().uuid(),

  supplierId: z.string().uuid().nullable().optional(),

  purchasePrice: priceSchema,

  sellingPrice: priceSchema,

  lowStockThreshold: z
    .number()
    .int()
    .min(0)
    .max(2_147_483_647)
    .default(5),
}).strict();

export const updateProductSchema =
  createProductSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "Au moins un champ doit être fourni."
    );

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;