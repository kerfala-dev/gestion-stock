import { Router } from "express";

import {
	getStockMovements,
	createStockMovement
} from "./stock-movement.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getStockMovements);

router.post("/", requireRole("ADMIN", "MANAGER", "EMPLOYEE"), createStockMovement);

export default router;