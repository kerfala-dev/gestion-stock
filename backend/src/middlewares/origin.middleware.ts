
import type {
  Request,
  Response,
  NextFunction,
} from "express";

const frontendOrigin = new URL(
  process.env.FRONTEND_URL || "http://localhost:5173"
).origin;

export function verifyRequestOrigin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Les méthodes de lecture ne modifient pas les données
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("Origin");

  if (!origin || origin !== frontendOrigin) {
    res.status(403).json({
      success: false,
      message: "Origine de requête non autorisée.",
    });
    return;
  }

  next();
}
