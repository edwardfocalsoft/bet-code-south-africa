
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";

/**
 * Fetches a user's profile from Supabase
 * @param userId The user's ID
 * @returns A user object or null if not found
 */
export const fetchUserProfile = async (userId: string): Promise<UserType | null> => {
  try {
    // First check if the profiles table exists and is accessible
    const { error: tableCheckError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1)
      .throwOnError();
    
    if (tableCheckError) {
      console.error("Error checking profiles table:", tableCheckError);
      // If we can't access the profiles table, create a temporary user object with minimal info
      // This helps prevent authentication deadlocks
      const { data: userData } = await supabase.auth.getUser(userId);
      if (userData?.user) {
        // Create a minimal user profile to allow login to proceed
        return {
          id: userData.user.id,
          email: userData.user.email || "",
          role: (userData.user.user_metadata?.role || "buyer") as any,
          createdAt: new Date(),
        };
      }
      return null;
    }

    // Try to get user profile directly without using .single()
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);
    
    if (profileError || !profileData || profileData.length === 0) {
      console.error("Error fetching user profile or profile not found:", profileError);
      
      // As fallback, try to get minimal user data if profile query failed
      const { data: userData } = await supabase.auth.getUser(userId);
      if (userData?.user) {
        // Create a minimal user profile from auth data
        return {
          id: userData.user.id,
          email: userData.user.email || "",
          role: (userData.user.user_metadata?.role || "buyer") as any,
          createdAt: new Date(),
        };
      }
      return null;
    }
    
    const profileRow = profileData[0];
    
    // Transform the Supabase data format to our User type format
    // Handle null values that might cause TypeScript errors
    const user: UserType = {
      id: profileRow.id,
      email: profileRow.email || "",
      role: profileRow.role || "buyer",
      username: profileRow.username || undefined,
      createdAt: profileRow.created_at ? new Date(profileRow.created_at) : new Date(),
      approved: Boolean(profileRow.approved),
      suspended: Boolean(profileRow.suspended),
      loyaltyPoints: profileRow.loyalty_points || 0,
      // Remove this line to fix the TypeScript error
      // avatar_url: profileRow.avatar_url || undefined
    };
    
    return user;
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
