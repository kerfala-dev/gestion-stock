
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as service from "./auth.service.js";
import { loginSchema } from "./auth.validation.js";

import type { AuthenticatedUser } from "../../types/auth.js";

const COOKIE_NAME = "stockmanager_access";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api",
  maxAge: 60 * 60 * 1000,
};

// POST /api/auth/login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
      return;
    }

    const authentication = await service.login(
      result.data.email,
      result.data.password
    );

    res.cookie(
      COOKIE_NAME,
      authentication.token,
      cookieOptions
    );

    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      data: authentication.user,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
export function logout(
  _req: Request,
  res: Response
): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  res.status(200).json({
    success: true,
    message: "Déconnexion réussie.",
  });
}

// GET /api/auth/me
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentification requise.",
      });
      return;
    }

    const auth = req.auth as AuthenticatedUser;
    const user = await service.getCurrentUser(auth.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
