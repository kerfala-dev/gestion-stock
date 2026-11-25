
import { prisma } from "../lib/prisma.js";

async function main() {
  // 1. Créer l'entreprise
  const organization = await prisma.organization.upsert({
    where: {
      slug: "demo-stockmanager",
    },
    update: {},
    create: {
      name: "Entreprise Démonstration",
      slug: "demo-stockmanager",
    },
  });

  // 2. Créer la catégorie
  const category = await prisma.category.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "Général",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Général",
      description: "Catégorie par défaut",
    },
  });

  // 3. Créer un produit de démonstration
  const product = await prisma.product.upsert({
    where: {
      organizationId_sku: {
        organizationId: organization.id,
        sku: "CLAV-001",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      categoryId: category.id,

      sku: "CLAV-001",
      name: "Clavier mécanique",
      description: "Clavier USB professionnel",

      purchasePrice: 250,
      sellingPrice: 350,

      quantity: 10,
      lowStockThreshold: 5,
    },
  });

  console.log("Entreprise :", organization.name);
  console.log("Catégorie :", category.name);
  console.log("Produit :", product.name);

  console.log("Initialisation réussie !");
}

main()
  .catch((error) => {
    console.error("Erreur Seed :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
