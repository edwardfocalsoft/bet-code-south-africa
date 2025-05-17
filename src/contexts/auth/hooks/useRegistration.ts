
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { cleanupAuthState } from "../authUtils";

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
      
      // Skip email validation - rely on Supabase's built-in validation
      
      // Create account without any redirects to avoid auth state issues
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
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
      throw error;
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
