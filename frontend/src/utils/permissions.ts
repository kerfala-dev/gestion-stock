
import type { UserRole } from "../types/auth";

export type Permission =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "CATEGORY_CREATE"
  | "CATEGORY_UPDATE"
  | "CATEGORY_DELETE"
  | "SUPPLIER_CREATE"
  | "SUPPLIER_UPDATE"
  | "SUPPLIER_DELETE"
  | "STOCK_MOVEMENT_CREATE";

const permissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DELETE",
    "CATEGORY_CREATE",
    "CATEGORY_UPDATE",
    "CATEGORY_DELETE",
    "SUPPLIER_CREATE",
    "SUPPLIER_UPDATE",
    "SUPPLIER_DELETE",
    "STOCK_MOVEMENT_CREATE",
  ],

  MANAGER: [
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "CATEGORY_CREATE",
    "CATEGORY_UPDATE",
    "SUPPLIER_CREATE",
    "SUPPLIER_UPDATE",
    "STOCK_MOVEMENT_CREATE",
  ],

  EMPLOYEE: [
    "STOCK_MOVEMENT_CREATE",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return permissions[role].includes(permission);
}
