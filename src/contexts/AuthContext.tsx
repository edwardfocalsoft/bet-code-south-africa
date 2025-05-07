
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export interface AuthContextType {
  currentUser: UserType | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserType | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<UserType | null>;
  register: (email: string, password: string, role: UserRole) => Promise<UserType | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionData = data?.session;
      
      if (sessionData?.user) {
        await fetchUser(sessionData.user.id);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUser(session.user.id);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
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
      uiToast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
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
      uiToast({
        title: "Success",
        description: "Please check your email to confirm your registration.",
      });
      
      if (data.user) {
        // Create a user object to return
        const userObj: UserType = {
          id: data.user.id,
          email: data.user.email || email,
          role: role,
          createdAt: new Date(),
        };
        navigate("/auth/register/confirmation");
        return userObj;
      }
      return null;
    } catch (error: any) {
      console.error("Signup error", error);
      uiToast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Alias signup to register for backward compatibility
  const signup = register;

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
        // Fetch the user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        
        if (profileData) {
          const userObj: UserType = {
            id: data.user.id,
            email: data.user.email || email,
            role: profileData.role,
            username: profileData.username,
            createdAt: new Date(profileData.created_at),
            approved: profileData.approved,
            suspended: profileData.suspended,
            loyaltyPoints: profileData.loyalty_points,
          };
          
          setCurrentUser(userObj);
          setUserRole(profileData.role);
          
          uiToast({
            title: "Success",
            description: "Logged in successfully.",
          });
          
          return userObj;
        }
      }
      return null;
    } catch (error: any) {
      console.error("Login error", error);
      uiToast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
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
      uiToast({
        title: "Success",
        description: "Logged out successfully.",
      });
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Logout error", error);
      uiToast({
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
    register,
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
