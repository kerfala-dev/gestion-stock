import type {
	Request,
	Response,
	NextFunction,
} from "express";

import * as service from "./stock-movement.service.js";
import {
	createStockMovementSchema,
	stockMovementQuerySchema
} from "./stock-movement.validation.js";

// GET /api/stock-movements
export async function getStockMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const result = stockMovementQuerySchema.safeParse({
			productId: req.query.productId,
			type: req.query.type,
		});

		if (!result.success) {
			res.status(400).json({
				success: false,
				errors: result.error.issues
			});
			return;
		}

		const movements = await service.getStockMovements(req.auth!.organizationId,result.data);
		res.status(200).json({
			success: true,
			data: movements
		});
	} catch (error) {
		next(error);
	}
}

// POST /api/stock-movements
export async function createStockMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const result = createStockMovementSchema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({
				success: false,
				errors: result.error.issues
			});
			return;
		}

		const movement = await service.createStockMovement(req.auth!.organizationId,result.data);

		res.status(201).json({
			success: true,
			message: "Mouvement de stock enregistre avec succes.",
			data: movement,
		});
	} catch (error) {
		next(error);
	}
}