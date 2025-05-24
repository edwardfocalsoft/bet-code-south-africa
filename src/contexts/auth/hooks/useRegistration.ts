
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { cleanupAuthState } from "../authUtils";

/**
 * Hook for handling user registration functionality
 */
export const useRegistration = () => {
  const [loading, setLoading] = useState(false);

  const register = async (email: string, password: string, role: UserRole): Promise<UserType | null> => {
    try {
      setLoading(true);
      
      // First cleanup any existing auth state
      cleanupAuthState();
      
      // Create account with email confirmation enabled
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { role },
          emailRedirectTo: window.location.origin + "/auth/login"
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
