
import type {
  Produit,
  CreateProduitPayload,
  UpdateProduitPayload,
} from "../types/produits";

import { apiRequest } from "./api";

// GET : récupérer les produits
export async function getProducts(
  search = "",
  signal?: AbortSignal
): Promise<Produit[]> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  return apiRequest<Produit[]>(
    `/products${query ? `?${query}` : ""}`,
    { signal }
  );
}

// POST : ajouter un produit
export async function createProduct(
  data: CreateProduitPayload
): Promise<Produit> {
  return apiRequest<Produit>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT : modifier un produit
export async function updateProduct(
  id: string,
  data: UpdateProduitPayload
): Promise<Produit> {
  return apiRequest<Produit>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

// DELETE : supprimer un produit
export async function deleteProduct(id: string): Promise<void> {
  await apiRequest<void>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
