import { prisma } from "../../lib/prisma.js";

import type {
	CreateStockMovementInput,
	StockMovementFilters
} from "./stock-movement.validation.js";

function createHttpError(message: string, statusCode: number) {
	return Object.assign(new Error(message), {
		statusCode,
	});
}

// Recuperer l'historique des mouvements
export async function findAll(organizationId: string, filters: StockMovementFilters) {

	return prisma.stockMovement.findMany({
		where: {
			organizationId,

			...(filters.productId ? { productId: filters.productId} : {}),

			...(filters.type ? { type: filters.type } : {}),
		},
		include: {
			product: {
				select: {
					id: true,
					sku: true,
					name: true,
				},
			},
		},

		orderBy: {
			createdAt: "desc",
		},

		take: 100,
	});
}

// Enregistrer un mouvement et actualiser le stock
export async function create(
  organizationId: string,
  data: CreateStockMovementInput
) {
  return prisma.$transaction(async (tx) => {

    // Vérifier que le produit appartient à l'organisation
    const product = await tx.product.findFirst({
      where: {
        id: data.productId,
        organizationId,
      },
    });

    if (!product) {
      throw createHttpError("Produit introuvable.", 404);
    }

    // Calculer la variation du stock
    let delta: number;

    switch (data.type) {
      case "ENTRY":
        delta = data.quantity;
        break;

      case "EXIT":
        delta = -data.quantity;
        break;

      case "ADJUSTMENT":
        delta = data.quantity;
        break;
    }

    // Mettre à jour le stock de manière atomique
    const updateResult = await tx.product.updateMany({
      where: {
        id: product.id,
        organizationId,
        ...(delta < 0
          ? { quantity: { gte: Math.abs(delta) } }
          : {}),
      },

      data: {
        quantity:
          delta > 0
            ? { increment: delta }
            : { decrement: Math.abs(delta) },
      },
    });

    if (updateResult.count !== 1) {
      throw createHttpError(
        "Stock insuffisant pour effectuer cette opération.",
        409
      );
    }

    // Enregistrer le mouvement
    const movement = await tx.stockMovement.create({
      data: {
        organizationId,
        productId: product.id,
        type: data.type,
        quantity: data.quantity,
        note: data.note,
      },

      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
    });

    return movement;
  });
}