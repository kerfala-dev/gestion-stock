import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as service from "./dashboard.service.js";

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dashboard = await service.getDashboard(req.auth!.organizationId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}