
import "dotenv/config";

import argon2 from "argon2";

import { prisma } from "../lib/prisma.js";

async function main() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Nom, email et mot de passe administrateur requis."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Le mot de passe doit contenir au moins 12 caractères."
    );
  }

  // Retrouver l'entreprise existante
  const organization = await prisma.organization.findUnique({
    where: {
      slug: "demo-stockmanager",
    },
  });

  if (!organization) {
    throw new Error("Entreprise de démonstration introuvable.");
  }

  // Éviter de créer deux fois le même compte
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(
      "Cet utilisateur existe déjà. Aucun compte n'a été modifié."
    );
  }

  // Hashage sécurisé du mot de passe
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  // Créer le compte administrateur
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      organizationId: organization.id,
    },
  });

  console.log("Administrateur créé avec succès !");
  console.log("Nom :", user.name);
  console.log("Email :", user.email);
  console.log("Rôle :", user.role);
  console.log("Entreprise :", organization.name);
}

main()
  .catch((error) => {
    console.error("Erreur création administrateur :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
