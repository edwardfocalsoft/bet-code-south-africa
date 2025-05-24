
import { useAuthState } from "./hooks/useAuthState";
import { useRegistration } from "./hooks/useRegistration";
import { useAuthentication } from "./hooks/useAuthentication";
import { useRouteAccess } from "./hooks/useRouteAccess";

/**
 * The main auth provider hook that composes all auth-related functionality
 */
export const useAuthProvider = () => {
  // Auth state management
  const { 
    currentUser, 
    userRole, 
    loading, 
    isAdmin, 
    setCurrentUser,
    setUserRole,
    setIsAdmin 
  } = useAuthState();

  // Registration functionality
  const { register, signup } = useRegistration();

  // Authentication functionality
  const { login, logout } = useAuthentication(
    setCurrentUser,
    setUserRole,
    setIsAdmin
  );

  // Route access check
  const { checkRouteAccess } = useRouteAccess(currentUser, userRole);

  return {
    // User state
    currentUser,
    user: currentUser, // For backward compatibility
    userRole,
    loading,
    isAdmin,
    isInitialized: !loading, // For backward compatibility
    
    // Auth functions
    login,
    logout,
    signup,
    register,
    
    // Route access
    checkRouteAccess
  };
};
