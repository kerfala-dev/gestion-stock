
import { Router } from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
    updateUserStatus,
} from "./user.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Consulter les utilisateurs
router.get("/", getUsers);
router.patch(
  "/:id/status",
   requireRole("ADMIN"),
  updateUserStatus
);
router.get("/:id", getUser);

// Créer un compte : ADMIN ou MANAGER
router.post(
  "/",
  requireRole("ADMIN", "MANAGER"),
  createUser
);

// Modifier un compte : ADMIN ou MANAGER
router.put(
  "/:id",
  requireRole("ADMIN", "MANAGER"),
  updateUser
);

export default router;
