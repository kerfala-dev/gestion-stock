import * as repository from "./supplier.repository.js";
import type {
	CreateSupplierInput,
	UpdateSupplierInput
} from "./supplier.validation.js";

export function getSuppliers(organizationId: string, search = "") {
	return repository.findAll(organizationId, search.trim());
}

export function getSupplier(organizationId: string, id: string) {
	return repository.findById(organizationId, id);
}

export function createSupplier(organizationId: string, data: CreateSupplierInput) {
	return repository.create(organizationId, data);
}

export function updateSupplier(organizationId: string, id: string, data: UpdateSupplierInput) {
	return repository.update(organizationId, id, data);
}

export function deleteSupplier(organizationId: string, id: string) {
	return repository.remove(organizationId, id);
}