
import { User, UserRole } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<User | null>;
  register: (email: string, password: string, role: UserRole) => Promise<User | null>;
}
