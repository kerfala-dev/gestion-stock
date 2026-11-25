import * as repository from "./stock-movement.repository.js";
import type {
	CreateStockMovementInput,
	StockMovementFilters
} from "./stock-movement.validation.js";

export function getStockMovements(organizationId: string,filters: StockMovementFilters) {
	return repository.findAll(organizationId, filters);
}

export function createStockMovement(organizationId: string, data: CreateStockMovementInput) {
	return repository.create(organizationId, data);
}