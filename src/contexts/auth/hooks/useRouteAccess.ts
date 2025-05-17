
import { User as UserType, UserRole } from "@/types";

/**
 * Hook to check if a user has access to a specific route based on role
 */
export const useRouteAccess = (
  currentUser: UserType | null,
  userRole: UserRole | null
) => {
  const checkRouteAccess = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser || !userRole) return false;
    return allowedRoles.includes(userRole);
  };

  return {
    checkRouteAccess
  };
};
