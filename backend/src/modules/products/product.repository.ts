
import { prisma } from "../../lib/prisma.js";

import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.validation.js";

// GET : tous les produits de l'entreprise connectée
export async function findAll(
  organizationId: string,
  search = ""
) {
  return prisma.product.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    include: {
      category: true,
      supplier: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// GET : un produit
export async function findById(
  organizationId: string,
  id: string
) {
  return prisma.product.findFirst({
    where: {
      id,
      organizationId,
    },

    include: {
      category: true,
      supplier: true,
    },
  });
}

// POST : créer un produit
export async function create(
  organizationId: string,
  data: CreateProductInput
) {
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      organizationId,
    },
  });

  if (!category) {
    throw Object.assign(
      new Error("Catégorie invalide ou introuvable."),
      { statusCode: 400 }
    );
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        organizationId,
      },
    });

    if (!supplier) {
      throw Object.assign(
        new Error("Fournisseur invalide ou introuvable."),
        { statusCode: 400 }
      );
    }
  }

  return prisma.product.create({
    data: {
      ...data,
      organizationId,
    },

    include: {
      category: true,
      supplier: true,
    },
  });
}

// PUT : modifier un produit
// PUT : modifier un produit en respectant son organisation
export async function update(
  organizationId: string,
  id: string,
  data: UpdateProductInput
) {
  const existing = await prisma.product.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!existing) return null;

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        organizationId,
      },
    });

    if (!category) {
      throw Object.assign(
        new Error("Catégorie invalide."),
        { statusCode: 400 }
      );
    }
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        organizationId,
      },
    });

    if (!supplier) {
      throw Object.assign(
        new Error("Fournisseur invalide."),
        { statusCode: 400 }
      );
    }
  }

  const result = await prisma.product.updateMany({
    where: {
      id,
      organizationId,
    },
    data,
  });

  if (result.count === 0) return null;

  return prisma.product.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      category: true,
      supplier: true,
    },
  });
}

// DELETE : supprimer un produit en respectant son organisation
export async function remove(
  organizationId: string,
  id: string
) {
  const result = await prisma.product.deleteMany({
    where: {
      id,
      organizationId,
    },
  });

  return result.count > 0;
}