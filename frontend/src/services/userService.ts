
import { apiRequest } from "./api";

import type { ManagedUser } from "../types/auth";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "MANAGER" | "EMPLOYEE";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

// Récupérer tous les utilisateurs
export function getUsers(): Promise<ManagedUser[]> {
  return apiRequest<ManagedUser[]>("/users");
}

// Créer un utilisateur
export function createUser(
  data: CreateUserData
): Promise<ManagedUser> {
  return apiRequest<ManagedUser>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Modifier un utilisateur
export function updateUser(
  id: string,
  data: UpdateUserData
): Promise<ManagedUser> {
  return apiRequest<ManagedUser>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Activer ou désactiver un utilisateur
export function updateUserStatus(
  id: string,
  isActive: boolean
): Promise<ManagedUser> {
  return apiRequest<ManagedUser>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
