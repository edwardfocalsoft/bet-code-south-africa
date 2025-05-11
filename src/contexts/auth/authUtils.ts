
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";

export const cleanupAuthState = () => {
  try {
    // Clear all auth-related data from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log("Auth state cleaned up");
  } catch (error) {
    console.error("Error cleaning up auth state:", error);
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserType | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      console.log("No profile found for user:", userId);
      return null;
    }
    
    console.log("Profile found:", data);
    
    // Map from database schema to application user type
    const userProfile: UserType = {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      username: data.username || undefined,
      createdAt: new Date(data.created_at),
      approved: data.approved,
      suspended: data.suspended,
      loyaltyPoints: data.loyalty_points || 0,
      avatar_url: data.avatar_url || undefined
    };
    
    return userProfile;
  } catch (error) {
    console.error("Exception fetching user profile:", error);
    return null;
  }
};
