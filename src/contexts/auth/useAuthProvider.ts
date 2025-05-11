
import { useState, useEffect, useCallback } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();

  // Initial session check and auth state listener setup
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile) {
                setCurrentUser(userProfile);
                setUserRole(userProfile.role);
                setIsAdmin(userProfile.role === 'admin');

                // Special handling for admin users
                if (userProfile.role === 'admin' && location.pathname === '/auth/login') {
                  navigate('/admin/dashboard');
                }
              } else {
                console.log("No user profile found for", session.user.id);
              }
            } catch (error) {
              console.error("Profile fetch error in auth listener:", error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;
        
        if (sessionUser) {
          const userProfile = await fetchUserProfile(sessionUser.id);
          if (userProfile) {
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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

  const login = async (email: string, password: string): Promise<UserType | null> => {
    try {
      setLoading(true);
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Check if we're attempting to login with the admin credentials
      const isAdminLogin = email.toLowerCase() === "admin@bettickets.com";
      
      // Try to sign out before signing in to ensure a clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Pre-signout failed, continuing", err);
      }
      
      // Use signInWithPassword with improved error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Fetch user profile
        try {
          const userProfile = await fetchUserProfile(data.user.id);
          
          if (userProfile) {
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
            
            toast.success("Logged in successfully.");
            
            // Check if user has a username set
            if (!userProfile.username) {
              // Redirect to profile setup
              navigate('/auth/profile-setup');
              return userProfile;
            } else {
              // Redirect based on user role
              if (userProfile.role === 'admin') {
                navigate('/admin/dashboard');
              } else if (userProfile.role === 'seller') {
                navigate('/seller/dashboard');
              } else {
                navigate('/buyer/dashboard');
              }
              return userProfile;
            }
          } else {
            // No profile found
            if (isAdminLogin) {
              toast.error("Admin account not found. Database might need seeding.");
              navigate('/admin/seed-database');
            } else {
              toast.error("User profile not found. Please contact support.");
            }
            await supabase.auth.signOut();
            cleanupAuthState();
            return null;
          }
        } catch (profileError: any) {
          console.error("Profile fetch error", profileError);
          
          if (isAdminLogin) {
            toast.error("Admin account not set up. Database might need seeding.");
            navigate('/admin/seed-database');
          } else {
            toast.error("Error loading user profile. Please try again.");
          }
          
          // Try to clean up the failed login
          await supabase.auth.signOut();
          cleanupAuthState();
          throw new Error("Could not fetch user profile");
        }
      }
      return null;
    } catch (error: any) {
      console.error("Login error", error);
      
      const isAdminLogin = email.toLowerCase() === "admin@bettickets.com";
      let errorMessage = error.message || "Authentication failed.";
      
      // Check for service unavailability or admin seeding issues
      if (
        errorMessage.includes("Database error") || 
        errorMessage.includes("querying schema") || 
        errorMessage.includes("temporarily unavailable") ||
        errorMessage.includes("not match") && isAdminLogin ||
        error.code === "unexpected_failure"
      ) {
        if (isAdminLogin) {
          errorMessage = "Admin account not set up or database error occurred. Database might need seeding.";
          navigate('/admin/seed-database');
        } else {
          errorMessage = "Authentication service temporarily unavailable. Please try again later.";
        }
      }
      
      uiToast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
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
      setIsAdmin(false);
      
      uiToast({
        title: "Success",
        description: "Logged out successfully.",
      });
      
      // Using navigate for a cleaner UX
      navigate('/auth/login');
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

  // Check if user has access to a specific route based on role
  const checkRouteAccess = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser || !userRole) return false;
    return allowedRoles.includes(userRole);
  };

  return {
    currentUser,
    userRole,
    loading,
    isAdmin,
    login,
    logout,
    signup,
    register,
    checkRouteAccess
  };
};
