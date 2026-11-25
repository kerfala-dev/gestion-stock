
import { prisma } from "../../lib/prisma.js";

export async function getDashboardData(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Entreprise introuvable.");
  }

  // Récupération des données en parallèle
  const [
    products,
    categoriesCount,
    suppliersCount,
    recentMovements,
  ] = await Promise.all([

    prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        sku: true,
        name: true,
        quantity: true,
        lowStockThreshold: true,
        purchasePrice: true,

        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.category.count({
      where: { organizationId },
    }),

    prisma.supplier.count({
      where: { organizationId },
    }),

    prisma.stockMovement.findMany({
      where: { organizationId },

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

      take: 8,
    }),
  ]);

  // Détecter les stocks faibles
  const lowStockProducts = products.filter(
    (product) =>
      product.quantity <= product.lowStockThreshold
  );

  // Calculer la valeur du stock au prix d'achat
  const stockValue = products.reduce(
    (total, product) =>
      total +
      Number(product.purchasePrice) * product.quantity,
    0
  );

  return {
    stats: {
      productsCount: products.length,
      categoriesCount: categoriesCount,
      suppliersCount: suppliersCount,
      lowStockCount: lowStockProducts.length,
      stockValue: Number(stockValue.toFixed(2)),
    },

    lowStockProducts,

    recentMovements,
  };
}
