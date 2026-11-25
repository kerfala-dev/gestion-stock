import { z } from "zod";

const commonFields = {
	productId: z.string().uuid(),
	note: z.string().trim().max(500).optional(),
};

const MAX_QUANTITY = 2_147_483_647;

export const createStockMovementSchema = z.discriminatedUnion("type", [
	// Entree : quantite obligatoirement positive
	z.object({
		...commonFields,
		type: z.literal("ENTRY"),
		quantity: z.number().int().positive().max(MAX_QUANTITY),
	}),

	    // SORTIE : quantité positive
    z.object({
      ...commonFields,
      type: z.literal("EXIT"),
      quantity: z.number().int().positive().max(MAX_QUANTITY),
    }),

	// Ajustement : quantite positive ou negative,
	// mais jamais egale a zero
	z.object({
		...commonFields,
		type: z.literal("ADJUSTMENT"),
	    quantity: z
  .number()
  .int()
  .min(-MAX_QUANTITY)
  .max(MAX_QUANTITY)
  .refine(
    (value) => value !== 0,
    "Un ajustement doit être différent de zéro."
  ),
	})
]);

export const stockMovementQuerySchema = z.object({
	productId: z.string().uuid().optional(),
	type: z.enum([
		"ENTRY",
		"EXIT",
		"ADJUSTMENT",
	]).optional(),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;

export type StockMovementFilters = z.infer<typeof stockMovementQuerySchema>;