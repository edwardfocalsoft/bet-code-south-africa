
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
    
    // First check if this is the admin user via raw auth query
    const { data: userData, error: userError } = await supabase.auth
      .admin.getUserById(userId);
      
    if (userData?.user && userData.user.email === "admin@bettickets.com") {
      console.log("Admin user detected via email check");
      
      // Query profiles table to see if admin exists there
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        console.log("Admin profile found in profiles table:", profileData);
        // Return the profile data
        return {
          id: profileData.id,
          email: profileData.email,
          role: profileData.role as UserRole,
          username: profileData.username || undefined,
          createdAt: new Date(profileData.created_at),
          approved: profileData.approved,
          suspended: profileData.suspended,
          loyaltyPoints: profileData.loyalty_points || 0,
          avatar_url: profileData.avatar_url || undefined
        };
      } else {
        // Create an admin user object if not in profiles
        console.log("Creating admin user object as no profile found");
        return {
          id: userId,
          email: "admin@bettickets.com",
          role: "admin" as UserRole,
          createdAt: new Date(),
          approved: true
        };
      }
    }
    
    // For regular users, query the profiles table
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
    
    // Special handling for admin@bettickets.com
    if (userId === "21a911ea-b5af-4f00-b55e-ef0079031767" || 
        (await supabase.auth.getUser()).data?.user?.email === "admin@bettickets.com") {
      console.log("Falling back to hardcoded admin user");
      return {
        id: userId,
        email: "admin@bettickets.com",
        role: "admin" as UserRole,
        createdAt: new Date(),
        approved: true
      };
    }
    
    return null;
  }
};
