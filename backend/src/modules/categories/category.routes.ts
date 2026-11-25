import { Router } from "express";

import {
	getCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory
} from "./category.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post("/", requireRole("ADMIN", "MANAGER"), createCategory);

router.put("/:id", requireRole("ADMIN", "MANAGER"),  updateCategory);

router.delete("/:id", requireRole("ADMIN"),  deleteCategory);

export default router;