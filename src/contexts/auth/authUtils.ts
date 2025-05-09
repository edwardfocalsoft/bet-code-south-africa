
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";

/**
 * Fetches a user's profile from Supabase
 * @param userId The user's ID
 * @returns A user object or null if not found
 */
export const fetchUserProfile = async (userId: string): Promise<UserType | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      console.error("No user profile found for ID:", userId);
      return null;
    }
    
    return data as UserType;
  } catch (error) {
    console.error("Exception when fetching user profile:", error);
    return null;
  }
};

/**
 * Clean up all Supabase auth state from storage to prevent auth limbo states
 */
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });

  // Remove from sessionStorage if in use
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Some browsers may throw when accessing sessionStorage in certain contexts
    console.log("Could not clean sessionStorage", e);
  }
};
