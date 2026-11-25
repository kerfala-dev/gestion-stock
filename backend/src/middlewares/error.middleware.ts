
import type {
  Request,
  Response,
  NextFunction,
} from "express";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erreurs Prisma
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? (error as { code?: string }).code
      : undefined;

  if (code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Cette valeur existe déjà. Vérifie le nom ou le SKU.",
    });
    return;
  }

  if (code === "P2003") {
    res.status(409).json({
      success: false,
      message:
        "Impossible de supprimer cet élément : des données associées existent.",
    });
    return;
  }

  // Erreurs HTTP personnalisées
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : null;

  if (
    statusCode !== null &&
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode <= 599
  ) {
    res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.",
    });
    return;
  }

  // Erreur interne non prévue
  console.error("[ERROR]", error);

  res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue.",
  });
}
