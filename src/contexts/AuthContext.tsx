import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";

export interface AuthContextType {
  currentUser: UserType | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.session?.user) {
        await fetchUser(session.session.user.id);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    if ((session as any)?.data?.session?.user) {
      fetchUser((session as any)?.data?.session?.user?.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      setCurrentUser({
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        createdAt: new Date(user.created_at),
        approved: user.approved,
        suspended: user.suspended,
        loyaltyPoints: user.loyalty_points,
      });
      setUserRole(user.role);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/register/confirmation`,
        },
      });

      if (error) {
        throw error;
      }

      console.log("Signup data", data);
      toast({
        title: "Success",
        description: "Please check your email to confirm your registration.",
      });
      navigate("/auth/register/confirmation");
    } catch (error: any) {
      console.error("Signup error", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        await fetchUser(data.user.id);
      }

      toast({
        title: "Success",
        description: "Logged in successfully.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Login error", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setCurrentUser(null);
      setUserRole(null);
      toast({
        title: "Success",
        description: "Logged out successfully.",
      });
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Logout error", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
