
import { prisma } from "../../lib/prisma.js";

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function findSessionUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      organizationId: true,
      role: true,
      isActive: true,
    },
  });
}
