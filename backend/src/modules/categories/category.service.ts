import * as repository from "./category.repository.js";

import type { CreateCategoryInput, UpdateCategoryInput } from "./category.validation.js";

export function getCategories(organizationId: string, search = "") {
	return repository.findAll(organizationId, search.trim());
}

export function getCategory(organizationId: string, id: string) {
	return repository.findById(organizationId, id);
}

export function createCategory(organizationId: string, data: CreateCategoryInput) {
	return repository.create(organizationId,data);
}

export function updateCategory(organizationId: string, id: string, data: UpdateCategoryInput) {
	return repository.update(organizationId, id, data);
}

export function deleteCategory(organizationId: string, id: string) {
	return repository.remove(organizationId, id);
}