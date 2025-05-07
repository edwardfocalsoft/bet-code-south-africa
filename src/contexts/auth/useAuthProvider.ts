
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { fetchUserProfile, cleanupAuthState } from "./authUtils";
import { AuthContextType } from "./types";

export const useAuthProvider = (): AuthContextType => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;
      
      if (sessionUser) {
        const userProfile = await fetchUserProfile(sessionUser.id);
        if (userProfile) {
          setCurrentUser(userProfile);
          setUserRole(userProfile.role);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      cleanupAuthState();
      
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
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Fetch the user profile
        const userProfile = await fetchUserProfile(data.user.id);
        
        if (userProfile) {
          setCurrentUser(userProfile);
          setUserRole(userProfile.role);
          
          uiToast({
            title: "Success",
            description: "Logged in successfully.",
          });
          
          return userProfile;
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
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setCurrentUser(null);
      setUserRole(null);
      uiToast({
        title: "Success",
        description: "Logged out successfully.",
      });
      
      // Using window.location for a complete refresh instead of navigate
      window.location.href = "/auth/login";
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

  return {
    currentUser,
    userRole,
    loading,
    login,
    logout,
    signup,
    register,
  };
};
