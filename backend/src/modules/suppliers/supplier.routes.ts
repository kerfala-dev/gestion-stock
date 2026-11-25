import { Router } from "express";

import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "./supplier.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getSuppliers);
router.get("/:id", getSupplier);

router.post("/", requireRole("ADMIN", "MANAGER"), createSupplier);

router.put("/:id", requireRole("ADMIN", "MANAGER"), updateSupplier);

router.delete("/:id", requireRole("ADMIN"), deleteSupplier);

export default router;