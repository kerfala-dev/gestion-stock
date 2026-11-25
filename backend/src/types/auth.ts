export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  role: UserRole;
}