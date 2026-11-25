
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { verifyRequestOrigin } from "./middlewares/origin.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import { prisma } from "./lib/prisma.js";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import supplierRoutes from "./modules/suppliers/supplier.routes.js";
import stockMovementRoutes from "./modules/stock-movements/stock-movement.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(verifyRequestOrigin);

// Vérification du serveur et de PostgreSQL
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "API StockManager opérationnelle.",
      database: "connected",
    });
  } catch (error) {
    console.error("[HEALTH CHECK] Erreur PostgreSQL :", error);

    res.status(503).json({
      success: false,
      message: "Service temporairement indisponible.",
      database: "disconnected",
    });
  }
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Gestion globale des erreurs
app.use(errorMiddleware);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
