import * as repository from "./product.repository.js";

import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.validation.js";

export function getProducts(
  organizationId: string,
  search = ""
) {
  return repository.findAll(organizationId, search.trim());
}

export function getProduct(
  organizationId: string,
  id: string
) {
  return repository.findById(organizationId, id);
}

export function createProduct(
  organizationId: string,
  data: CreateProductInput
) {
  return repository.create(organizationId, data);
}

export function updateProduct(
  organizationId: string,
  id: string,
  data: UpdateProductInput
) {
  return repository.update(organizationId, id, data);
}

export function deleteProduct(
  organizationId: string,
  id: string
) {
  return repository.remove(organizationId, id);
}