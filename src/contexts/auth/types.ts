
import { User as UserType, UserRole } from "@/types";

export interface AuthContextType {
  // User state
  currentUser: UserType | null;
  user: UserType | null; // Add this for backward compatibility
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isInitialized: boolean; // Add this for backward compatibility
  
  // Auth functions
  login: (email: string, password: string) => Promise<UserType | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  
  // Route access
  checkRouteAccess: (requiredRole?: UserRole) => boolean;
}
