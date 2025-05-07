
import { supabase } from "@/integrations/supabase/client";
import { UserType, UserRole } from "@/types";

export const fetchUserProfile = async (userId: string): Promise<UserType | null> => {
  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      createdAt: new Date(user.created_at),
      approved: user.approved,
      suspended: user.suspended,
      loyaltyPoints: user.loyalty_points,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

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
