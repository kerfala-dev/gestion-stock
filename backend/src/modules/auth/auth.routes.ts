
import { Router } from "express";

import { rateLimit } from "express-rate-limit";

import {
  login,
  logout,
  getMe,
} from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives. Réessaie plus tard.",
  },
});

// Connexion
router.post("/login", loginLimiter, login);

// Déconnexion
router.post("/logout", logout);

// Informations de l'utilisateur connecté
router.get("/me", authenticate, getMe);

export default router;
