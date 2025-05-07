
import { User as UserType, UserRole } from "@/types";

export interface AuthContextType {
  currentUser: UserType | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserType | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<UserType | null>;
  register: (email: string, password: string, role: UserRole) => Promise<UserType | null>;
}
