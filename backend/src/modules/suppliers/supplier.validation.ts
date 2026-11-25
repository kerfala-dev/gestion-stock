import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2).max(120),

  contactName: z.string().trim().max(120).optional(),

  email: z.union([
    z.string().trim().email().max(255),
    z.literal(""),
  ]).optional(),

  phone: z.string().trim().max(30).optional(),

  address: z.string().trim().max(255).optional(),
}).strict();

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Au moins un champ doit être fourni."
  );

export type CreateSupplierInput =
  z.infer<typeof createSupplierSchema>;

export type UpdateSupplierInput =
  z.infer<typeof updateSupplierSchema>;