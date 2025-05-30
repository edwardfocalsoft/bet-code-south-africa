
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { cleanupAuthState, fetchUserProfile } from "../authUtils";

/**
 * Hook for handling login and logout functionality
 */
export const useAuthentication = (
  setCurrentUser: (user: UserType | null) => void,
  setUserRole: (role: UserRole | null) => void,
  setIsAdmin: (isAdmin: boolean) => void
) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

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
            
            // Check if the user is suspended
            if (userProfile.suspended === true) {
              console.log("Suspended user attempted login:", userProfile.id);
              toast.error("Your account has been suspended. Please contact support for assistance.");
              
              // Sign out the suspended user
              await supabase.auth.signOut({ scope: 'global' });
              cleanupAuthState();
              
              // Stay on login page
              navigate('/auth/login');
              throw new Error("Your account has been suspended. Please contact support for assistance.");
            }
            
            // Check if the user is a seller and not approved
            if (userProfile.role === 'seller' && userProfile.approved === false) {
              console.log("Unapproved seller attempted login:", userProfile.id);
              toast.error("Your seller account is pending approval by an admin. You'll be notified once approved.");
              
              // Sign out the unapproved seller
              await supabase.auth.signOut({ scope: 'global' });
              cleanupAuthState();
              
              // Redirect to a confirmation page
              navigate('/auth/register/confirmation?role=seller');
              return null;
            }
            
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
            
            toast.success("Logged in successfully.");
            
            // Check if user has a username set
            if (!userProfile.username) {
              // Redirect to profile setup if username is not set
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
      
      // Don't show toast for suspension messages as they're already shown above
      if (!errorMessage.includes("suspended")) {
        uiToast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
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

  return {
    login,
    logout,
    authLoading: loading,
    setAuthLoading: setLoading
  };
};
