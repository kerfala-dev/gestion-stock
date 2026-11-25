
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { verifyAccessToken } from "../modules/auth/auth.token.js";
import { findSessionUserById } from "../modules/auth/auth.repository.js";

import type { UserRole } from "../types/auth.js";

// Vérifier l'authentification et l'état du compte
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.stockmanager_access;

  if (!token || typeof token !== "string") {
    res.status(401).json({
      success: false,
      message: "Authentification requise.",
    });
    return;
  }

  try {
    // 1. Vérifier le JWT
    const payload = verifyAccessToken(token);

    // 2. Récupérer l'utilisateur actuel en base
    const user = await findSessionUserById(payload.userId);

    // 3. Vérifier l'existence et l'état du compte
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Compte inexistant ou désactivé.",
      });
      return;
    }

    // 4. Vérifier l'organisation
    if (user.organizationId !== payload.organizationId) {
      res.status(401).json({
        success: false,
        message: "Session invalide.",
      });
      return;
    }

    // 5. Utiliser le rôle actuel de la base de données
    req.auth = {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Session invalide ou expirée.",
    });
  }
}

// Vérifier les permissions
export function requireRole(...roles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentification requise.",
      });
      return;
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403).json({
        success: false,
        message: "Vous n'avez pas les permissions nécessaires.",
      });
      return;
    }

    next();
  };
}
