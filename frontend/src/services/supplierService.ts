
import { apiRequest } from "./api";

import type {
  Fournisseur,
  CreateFournisseurPayload,
} from "../types/fournisseur";

// GET
export async function getSuppliers(
  search = "",
  signal?: AbortSignal
): Promise<Fournisseur[]> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return apiRequest<Fournisseur[]>(
    `/suppliers?${params.toString()}`,
    { signal }
  );
}

// POST
export async function createSupplier(
  data: CreateFournisseurPayload
): Promise<Fournisseur> {
  return apiRequest<Fournisseur>("/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// PUT
export async function updateSupplier(
  id: string,
  data: Partial<CreateFournisseurPayload>
): Promise<Fournisseur> {
  return apiRequest<Fournisseur>(
    `/suppliers/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}

// DELETE
export async function deleteSupplier(
  id: string
): Promise<void> {
  await apiRequest<void>(
    `/suppliers/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
