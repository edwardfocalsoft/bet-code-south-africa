
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
              console.log("Auth state change detected, user logged in:", session.user.id);
              console.log("User email:", session.user.email);
              
              // Special handling for admin users via email check
              if (session.user.email === "admin@bettickets.com") {
                console.log("Admin user detected via email! Setting admin role directly.");
                const adminUser: UserType = {
                  id: session.user.id,
                  email: session.user.email,
                  role: 'admin',
                  createdAt: new Date(),
                  approved: true
                };
                setCurrentUser(adminUser);
                setUserRole('admin');
                setIsAdmin(true);
                
                // Navigate admin to admin dashboard if they're on the login page
                if (location.pathname === '/auth/login') {
                  navigate('/admin/dashboard');
                }
                setLoading(false);
                return;
              }
              
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile) {
                console.log("Profile found:", userProfile);
                setCurrentUser(userProfile);
                setUserRole(userProfile.role);
                setIsAdmin(userProfile.role === 'admin');

                // Special handling for admin users
                if (userProfile.role === 'admin' && location.pathname === '/auth/login') {
                  navigate('/admin/dashboard');
                }
              } else {
                console.log("No user profile found for", session.user.id);
                // If this is an admin login and no profile, take them to the seeding page
                if (session.user.email === "admin@bettickets.com") {
                  navigate('/admin/seed-database');
                }
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
          console.log("Initial session found, user:", sessionUser.id);
          console.log("User email:", sessionUser.email);
          
          // Special handling for admin users via email check
          if (sessionUser.email === "admin@bettickets.com") {
            console.log("Admin user detected via email! Setting admin role directly.");
            const adminUser: UserType = {
              id: sessionUser.id,
              email: sessionUser.email,
              role: 'admin',
              createdAt: new Date(),
              approved: true
            };
            setCurrentUser(adminUser);
            setUserRole('admin');
            setIsAdmin(true);
            setLoading(false);
            return;
          }
          
          const userProfile = await fetchUserProfile(sessionUser.id);
          if (userProfile) {
            console.log("Initial profile found:", userProfile);
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
          } else {
            console.log("No initial profile found for", sessionUser.id);
            // If this is an admin login and no profile, take them to the seeding page
            if (sessionUser.email === "admin@bettickets.com") {
              navigate('/admin/seed-database');
            }
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
      
      // CRITICAL FIX: Use a more direct approach without any redirect options
      // We'll skip email confirmation for now to get the signup process working
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          }
        }
      });

      if (error) {
        console.error("Signup error details:", error);
        throw error;
      }

      console.log("Signup successful, data:", data);
      
      if (data.user) {
        // Create a user profile in our profiles table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: role,
            });
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
          }
        } catch (profileErr) {
          console.error("Failed to create profile:", profileErr);
        }
        
        uiToast({
          title: "Success",
          description: "Account created successfully. You can now sign in.",
        });
        
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
      if (isAdminLogin) {
        console.log("Attempting admin login...");
      }
      
      // Try to sign out before signing in to ensure a clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Pre-signout failed, continuing", err);
      }
      
      // Use signInWithPassword with improved error handling
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.log("Login error:", error.message);
        
        // Special handling for admin schema issues
        if (isAdminLogin && (error.message.includes("Database error") || 
                             error.message.includes("querying schema") ||
                             error.message.includes("email_change"))) {
          console.log("Detected database schema issue with admin login, redirecting to seed page");
          toast.error("Admin account needs database schema fixes. Redirecting to seeding page.");
          navigate('/admin/seed-database');
          throw error;
        }
        
        throw error;
      }

      if (data?.user) {
        console.log("Login successful for:", data.user.id);
        
        // Special handling for admin via email
        if (isAdminLogin) {
          console.log("Admin login successful via email check!");
          const adminUser: UserType = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'admin',
            createdAt: new Date(),
            approved: true
          };
          
          setCurrentUser(adminUser);
          setUserRole('admin');
          setIsAdmin(true);
          
          toast.success("Admin logged in successfully.");
          navigate('/admin/dashboard');
          return adminUser;
        }
        
        // Fetch user profile for non-admin users
        try {
          const userProfile = await fetchUserProfile(data.user.id);
          
          if (userProfile) {
            console.log("Login profile found:", userProfile);
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
            
            toast.success("Logged in successfully.");
            
            // Check if user has a username set
            if (!userProfile.username && userProfile.role !== 'admin') {
              // Redirect to profile setup if not admin
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
            console.log("No profile found after login for", data.user.id);
            if (isAdminLogin) {
              console.log("Admin account not found, redirecting to seed page");
              toast.error("Admin account not found. Database might need seeding.");
              navigate('/admin/seed-database');
            } else {
              toast.error("User profile not found. Please contact support.");
            }
            return null;
          }
        } catch (profileError: any) {
          console.error("Profile fetch error during login:", profileError);
          
          if (isAdminLogin) {
            console.log("Admin profile fetch error, redirecting to seed page");
            toast.error("Admin account not set up. Database might need seeding.");
            navigate('/admin/seed-database');
            return null;
          } else {
            toast.error("Error loading user profile. Please try again.");
          }
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
        errorMessage.includes("email_change") ||
        (errorMessage.includes("not match") && isAdminLogin) ||
        error.code === "unexpected_failure"
      ) {
        if (isAdminLogin) {
          errorMessage = "Admin account not set up or database schema issue. Redirecting to seeding page.";
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
