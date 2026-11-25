import { prisma } from "../../lib/prisma.js";

import type { CreateCategoryInput, UpdateCategoryInput } from "./category.validation.js";

// Recuperer toutes les categories
export async function findAll(
  organizationId: string,
  search = ""
) {
  return prisma.category.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
}
// Recuperer une categorie
export async function findById(
  organizationId: string,
  id: string
) {
  return prisma.category.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

// Creer une categorie
export async function create(organizationId: string, data: CreateCategoryInput) {
	return prisma.category.create({
		data: {
			...data,
			organizationId,
		}
	});
}

// Modifier une categorie
// Modifier une catégorie en respectant son organisation
export async function update(
  organizationId: string,
  id: string,
  data: UpdateCategoryInput
) {
  const result = await prisma.category.updateMany({
    where: {
      id,
      organizationId,
    },
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.category.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

// Supprimer une categorie
// Supprimer une catégorie en respectant son organisation
export async function remove(
  organizationId: string,
  id: string
) {
  const result = await prisma.category.deleteMany({
    where: {
      id,
      organizationId,
    },
  });

  return result.count > 0;
}