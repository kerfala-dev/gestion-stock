import type {
	Request,
	Response,
	NextFunction,
} from "express";
 import * as service from "./product.service.js";

import {
	createProductSchema,
	updateProductSchema
} from "./product.validation.js";

// GET /api/products
export async function getProducts(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const search =
		  typeof req.query.search === "string"
		    ? req.query.search
			: "";
		const products = await service.getProducts(req.auth!.organizationId, search);
		
		res.status(200).json({
			success: true,
			data: products,
		});
	} catch (error) {
		next(error);
	}
}

// GET /api/products/:id
export async function getProduct(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	try {
	const product = await service.getProduct(req.auth!.organizationId, id);

		if (!product) {
			res.status(404).json({
				success: false,
				message: "Produit introuvable.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error)
	}
}

// POST /api/products
export async function createProduct(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const result = createProductSchema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({
				success: false,
				errors: result.error.issues,
			});
			return;
		}

		const product = await service.createProduct(req.auth!.organizationId,result.data);

		res.status(201).json({
			success: true,
			message: "Produit cree avec succes.",
			data: product,
		})
	} catch (error) {
		next(error);
	}
}

// PUT /api/products/:id
export async function updateProduct(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	try {
		const result = updateProductSchema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({
				success: false,
				errors: result.error.issues
			});
			return;
		}
		const product = await service.updateProduct(req.auth!.organizationId, id, result.data);

		if (!product) {
			res.status(404).json({
				success: false,
				message: "Produit introuvable.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Produit modifie avec succes.",
			data: product
		})
	} catch (error) {
		next(error);
	}
}

// DELETE /api/products/:id
export async function deleteProduct(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	try {
		const deleted = await service.deleteProduct(req.auth!.organizationId, id);

		if (!deleted) {
			res.status(404).json({
				success: false,
				message: "Produit introuvable.",
			});
			return;
		}
		res.status(200).json({
			success: true,
			message: "Produit supprime avec succes.",
		})
	} catch (error) {
		next(error);
	}
}