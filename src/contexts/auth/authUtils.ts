
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";

/**
 * Cleans up authentication state by removing Supabase auth-related keys
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Fetches user profile from the profiles table
 * @param userId The user ID to fetch the profile for
 * @returns User profile or null if not found
 */
export const fetchUserProfile = async (userId: string): Promise<UserType | null> => {
  if (!userId) {
    console.error("User ID is null or undefined");
    return null;
  }
  
  try {
    console.log(`Fetching profile for user ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    console.log("Profile data:", data);
    
    if (data) {
      // Transform the database record into our UserType
      const profile: UserType = {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role,
        createdAt: new Date(data.created_at),
        approved: data.approved || false, // Ensure approved is properly set
        suspended: data.suspended || false, // Ensure suspended is properly set
        loyaltyPoints: data.loyalty_points || 0
      };
      
      return profile;
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }
  
  return null;
};
