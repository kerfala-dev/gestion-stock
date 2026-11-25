
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as service from "./supplier.service.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "./supplier.validation.js";

// GET /api/suppliers
export async function getSuppliers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

    const suppliers = await service.getSuppliers(req.auth!.organizationId,search);

    res.status(200).json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/suppliers/:id
export async function getSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const supplier = await service.getSupplier(req.auth!.organizationId, id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Fournisseur introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/suppliers
export async function createSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = createSupplierSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const supplier = await service.createSupplier(req.auth!.organizationId,result.data);

    res.status(201).json({
      success: true,
      message: "Fournisseur créé avec succès.",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/suppliers/:id
export async function updateSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const result = updateSupplierSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const supplier = await service.updateSupplier(
      req.auth!.organizationId,
      id,
      result.data
    );

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Fournisseur introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Fournisseur modifié avec succès.",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/suppliers/:id
export async function deleteSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const deleted = await service.deleteSupplier(req.auth!.organizationId, id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Fournisseur introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Fournisseur supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
}
