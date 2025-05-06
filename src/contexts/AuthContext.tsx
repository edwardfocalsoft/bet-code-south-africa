
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { mockUsers } from "../data/mockData";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (email: string, password: string, role: "buyer" | "seller") => Promise<User | null>;
  updateUserProfile: (userData: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      // Simulating API call with mockData
      const user = mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        toast.error("Invalid email or password");
        return null;
      }

      // In a real app, you would validate the password here
      
      // Check if seller is approved
      if (user.role === "seller" && user.approved === false) {
        toast.error("Your seller account is pending approval");
        return null;
      }
      
      // Check if user is suspended
      if (user.suspended) {
        toast.error("Your account has been suspended");
        return null;
      }

      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast.success("Successfully logged in");
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: "buyer" | "seller"): Promise<User | null> => {
    setLoading(true);
    try {
      // Check if email already exists
      const existingUser = mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        toast.error("Email already registered");
        return null;
      }

      // Create new user
      const newUser: User = {
        id: `u${mockUsers.length + 1}`,
        email,
        role,
        createdAt: new Date(),
        // Sellers need approval, buyers don't
        approved: role === "buyer",
        loyaltyPoints: role === "buyer" ? 0 : undefined
      };

      // In a real app, you would store this in the database
      // mockUsers.push(newUser);
      
      if (role === "seller") {
        toast.success("Registration successful! Your seller account is pending approval.");
        return newUser;
      } else {
        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        toast.success("Registration successful!");
        return newUser;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.success("Successfully logged out");
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<User | null> => {
    if (!currentUser) return null;
    
    try {
      const updatedUser = { ...currentUser, ...userData };
      
      // In a real app, you would update the database here
      
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
