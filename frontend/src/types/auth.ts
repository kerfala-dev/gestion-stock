
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
