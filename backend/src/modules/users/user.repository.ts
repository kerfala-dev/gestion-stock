import { prisma } from "../../lib/prisma.js";

import type { CreateUserInput, UpdateUserInput } from "./user.validation.js";

// Recuperer tous les utilisateurs d'une organisation
export async function findAll(organizationId: string) {
	return prisma.user.findMany({
		where: { organizationId,},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
      isActive: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

// Recuperer un utilisateur par son ID
export async function findById(organizationId: string, id: string) {
	return prisma.user.findFirst({
		where: {id, organizationId,},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
      isActive: true,
			createdAt: true,
		},
	});
}

// Rechercher un utilisateur par email
export async function findByEmail(email: string) {
	return prisma.user.findUnique({
		where: {email,},
	});
}

// Creer un utilisateur
export async function create(organizationId: string, data: CreateUserInput, passwordHash: string) {
	return prisma.user.create({
		data: { 
			organizationId,
			name: data.name,
			email: data.email,
			passwordHash,
			role: data.role,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
      isActive: true,
			createdAt: true,
		},
	});
}

// Modifier un utilisateur
// Modifier un utilisateur en respectant son organisation
export async function update(
  organizationId: string,
  id: string,
  data: UpdateUserInput
) {
  const result = await prisma.user.updateMany({
    where: {
      id,
      organizationId,
    },
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateStatus(
  organizationId: string,
  id: string,
  isActive: boolean
) {
  const result = await prisma.user.updateMany({
    where: {
      id,
      organizationId,
    },
    data: {
      isActive,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}