import { prisma } from "../../lib/prisma.js";
import type { CreateSupplierInput, UpdateSupplierInput } from "./supplier.validation.js";

// GET : recuperer tous les fournisseurs
export async function findAll(organizationId: string, search = "") {

	return prisma.supplier.findMany({
		where: {
			organizationId,
			...(search ? {
				OR: [
					{
						name: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						contactName: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						email: {
							contains: search,
							mode: "insensitive",
						},
					},
				],
			} : {}),
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
		}
	});
}

// GET : recuperer un fournisseur par ID
export async function findById(organizationId: string, id: string) {

	return prisma.supplier.findFirst({
		where: {
			id,
			organizationId,
		},

		include: {
			_count: {
				select: {
					products: true,
				}
			}
		}
	})
}

// POST : creer un fournisseur
export async function create(organizationId: string, data: CreateSupplierInput) {

	return prisma.supplier.create({
		data: {
			...data,
			organizationId,
		}
	})
}
// PUT : Modifier un fournisseur en respectant son organisation
export async function update(
  organizationId: string,
  id: string,
  data: UpdateSupplierInput
) {
  const result = await prisma.supplier.updateMany({
    where: {
      id,
      organizationId,
    },
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.supplier.findFirst({
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

// DELETE : Supprimer un fournisseur en respectant son organisation
export async function remove(
  organizationId: string,
  id: string
) {
  const result = await prisma.supplier.deleteMany({
    where: {
      id,
      organizationId,
    },
  });

  return result.count > 0;
}