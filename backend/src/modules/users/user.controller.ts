
import type { Request, Response, NextFunction } from "express";

import * as service from "./user.service.js";

import {
  createUserSchema,
  updateUserSchema,
} from "./user.validation.js";

// GET /api/users
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await service.getUsers(
      req.auth!.organizationId
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/users/:id
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  try {
    const user = await service.getUser(
      req.auth!.organizationId,
      id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/users
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = createUserSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const user = await service.createUser(
      req.auth!.organizationId,
      req.auth!.role,
      result.data
    );

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/users/:id
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  try {
    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

const user = await service.updateUser(
  req.auth!.organizationId,
  req.auth!.role,
  id,
  result.data
);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur modifié avec succès.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
   const id = req.params.id;

if (typeof id !== "string") {
  return res.status(400).json({
    success: false,
    message: "Identifiant utilisateur invalide.",
  });
}
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Le champ isActive doit être un booléen.",
      });
    }

    const user = await service.updateUserStatus(
      req.auth!.organizationId,
      req.auth!.role,
      req.auth!.userId,
      id,
      isActive
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Compte utilisateur activé."
        : "Compte utilisateur désactivé.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
