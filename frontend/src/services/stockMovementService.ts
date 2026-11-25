import { apiRequest } from "./api";

import type {
	Mouvement,
	CreateMouvementPayload,
	MouvementFilters
} from "../types/mouvement";

// GET : recuperer l'historique
export async function getStockMovements(filters: MouvementFilters = {}, signal?: AbortSignal): Promise<Mouvement[]> {
	const params = new URLSearchParams();

	if (filters.productId) {
		params.set("ProductId", filters.productId);
	}

	if (filters.type) {
		params.set("type", filters.type);
	}

	return apiRequest<Mouvement[]>(`/stock-movements?${params.toString()}`, { signal });
}

// POST : enregistrer un mouvement
export async function createStockMovement(data: CreateMouvementPayload): Promise<Mouvement> {
	return apiRequest<Mouvement>("/stock-movements", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
}