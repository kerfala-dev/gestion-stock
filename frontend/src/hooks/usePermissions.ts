
import { useAuth } from "../contexts/AuthContext";
import {
  hasPermission,
  type Permission,
} from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  function can(permission: Permission): boolean {
    if (!user) return false;

    return hasPermission(user.role, permission);
  }

  return { can };
}
