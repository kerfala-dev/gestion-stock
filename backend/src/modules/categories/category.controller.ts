
import type { Request, Response, NextFunction } from "express";

import * as service from "./category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

// GET /api/categories
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : "";

    const categories = await service.getCategories(
      req.auth!.organizationId,
      search
    );

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/:id
export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  try {
    const category = await service.getCategory(
      req.auth!.organizationId,
      id
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/categories
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const category = await service.createCategory(
      req.auth!.organizationId,
      result.data
    );

    res.status(201).json({
      success: true,
      message: "Catégorie créée avec succès.",
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/categories/:id
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  try {
    const result = updateCategorySchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const category = await service.updateCategory(
      req.auth!.organizationId,
      id,
      result.data
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Catégorie modifiée avec succès.",
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/categories/:id
export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  try {
    const deleted = await service.deleteCategory(
      req.auth!.organizationId,
      id
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Catégorie introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
}
