import { apiRequest } from "./api";
import type { AuthUser, LoginCredentials } from "../types/auth";

// Connexion
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
	return apiRequest<AuthUser>("/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials),
	});
}

// Recuperation de l'utilisateur connecte
export async function getMe(): Promise<AuthUser> {
	return apiRequest<AuthUser>("/auth/me", {
		method: "GET",
	});
}

// Deconnexion
export async function logout(): Promise<void> {
	await apiRequest<void>("/auth/logout", {
		method: "POST",
	})
}