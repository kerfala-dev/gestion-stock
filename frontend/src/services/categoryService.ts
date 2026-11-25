
import { apiRequest } from "./api";
import type { Categorie, CreateCategoriePayload } from "../types/categorie";

export async function getCategories(
  search = "",
  signal?: AbortSignal
): Promise<Categorie[]> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  return apiRequest<Categorie[]>(
    `/categories${query ? `?${query}` : ""}`,
    { signal }
  );
}

export async function createCategory(
  data: CreateCategoriePayload
): Promise<Categorie> {
  return apiRequest<Categorie>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: CreateCategoriePayload
): Promise<Categorie> {
  return apiRequest<Categorie>(`/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<void>(`/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
