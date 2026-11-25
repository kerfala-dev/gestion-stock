import { Router } from "express";

import {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
} from "./product.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", requireRole("ADMIN", "MANAGER"), createProduct);

router.put("/:id", requireRole("ADMIN", "MANAGER"),  updateProduct);

router.delete("/:id", requireRole("ADMIN"),  deleteProduct);

export default router;