
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { cleanupAuthState } from "../authUtils";
import { validateEmail } from "@/utils/validation";

/**
 * Hook for handling user registration functionality
 */
export const useRegistration = () => {
  const [loading, setLoading] = useState(false);

  const register = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // First cleanup any existing auth state
      cleanupAuthState();
      
      // Validate email format using regex pattern
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      console.log("Starting signup for validated email:", email);
      
      // Create account without any redirects to avoid auth state issues
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), // Ensure no whitespace
        password,
        options: {
          // Avoid anything that might interfere with signup flow
          emailRedirectTo: undefined,
          data: { role }
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
          } else {
            console.log("Profile created successfully for", data.user.email);
          }
        } catch (profileErr) {
          console.error("Failed to create profile:", profileErr);
        }
        
        // Create a user object to return
        const userObj: UserType = {
          id: data.user.id,
          email: data.user.email || email,
          role: role,
          createdAt: new Date(),
        };
        
        return userObj;
      }
      
      return null;
    } catch (error: any) {
      console.error("Signup error", error);
      
      // Ensure we get a clear error message for email validation
      if (error.message.includes("email") || error.message.includes("Email")) {
        throw new Error("The email address is invalid. Please check and try again.");
      }
      
      // For other errors
      throw new Error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Alias signup to register for backward compatibility
  const signup = register;

  return {
    register,
    signup,
    loading,
    setLoading
  };
};
