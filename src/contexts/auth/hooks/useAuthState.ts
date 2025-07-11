
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType, UserRole } from "@/types";
import { fetchUserProfile } from "../authUtils";

/**
 * Hook to manage authentication state
 * Handles initial loading and subscription to auth state changes
 */
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initial session check and auth state listener setup
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(async () => {
            try {
              console.log("Auth state change detected, user logged in:", session.user.id);
              console.log("User email:", session.user.email);
              
              // Special handling for admin users via email check
              if (session.user.email === "admin@bettickets.com") {
                console.log("Admin user detected via email! Setting admin role directly.");
                const adminUser: UserType = {
                  id: session.user.id,
                  email: session.user.email,
                  role: 'admin',
                  createdAt: new Date(),
                  approved: true
                };
                setCurrentUser(adminUser);
                setUserRole('admin');
                setIsAdmin(true);
                setLoading(false);
                return;
              }
              
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile) {
                console.log("Profile found:", userProfile);
                
                // Check if user is suspended
                if (userProfile.suspended === true) {
                  console.log("Suspended user detected in auth state change");
                  // Sign out suspended users immediately
                  setCurrentUser(null);
                  setUserRole(null);
                  setIsAdmin(false);
                  
                  try {
                    await supabase.auth.signOut();
                  } catch (err) {
                    console.error("Error signing out suspended user:", err);
                  }
                  setLoading(false);
                  return;
                }
                
                // Set user data - no approval check needed anymore since sellers are auto-approved
                setCurrentUser(userProfile);
                setUserRole(userProfile.role);
                setIsAdmin(userProfile.role === 'admin');
                
                // Redirect to profile setup if user doesn't have a username
                if (!userProfile.username && window.location.pathname !== '/auth/profile-setup') {
                  window.location.href = '/auth/profile-setup';
                  return;
                }
              } else {
                console.log("No user profile found for", session.user.id);
                setCurrentUser(null);
                setUserRole(null);
                setIsAdmin(false);
              }
            } catch (error) {
              console.error("Profile fetch error in auth listener:", error);
              setCurrentUser(null);
              setUserRole(null);
              setIsAdmin(false);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;
        
        if (sessionUser) {
          console.log("Initial session found, user:", sessionUser.id);
          console.log("User email:", sessionUser.email);
          
          // Special handling for admin users via email check
          if (sessionUser.email === "admin@bettickets.com") {
            console.log("Admin user detected via email! Setting admin role directly.");
            const adminUser: UserType = {
              id: sessionUser.id,
              email: sessionUser.email,
              role: 'admin',
              createdAt: new Date(),
              approved: true
            };
            setCurrentUser(adminUser);
            setUserRole('admin');
            setIsAdmin(true);
            setLoading(false);
            return;
          }
          
          const userProfile = await fetchUserProfile(sessionUser.id);
          if (userProfile) {
            console.log("Initial profile found:", userProfile);
            
            // Check if user is suspended
            if (userProfile.suspended === true) {
              console.log("Suspended user detected in initial session");
              // Sign out suspended users immediately
              setCurrentUser(null);
              setUserRole(null);
              setIsAdmin(false);
              
              try {
                await supabase.auth.signOut();
              } catch (err) {
                console.error("Error signing out suspended user:", err);
              }
              setLoading(false);
              return;
            }
            
            // Set user data - no approval check needed anymore since sellers are auto-approved
            setCurrentUser(userProfile);
            setUserRole(userProfile.role);
            setIsAdmin(userProfile.role === 'admin');
            
            // Redirect to profile setup if user doesn't have a username
            if (!userProfile.username && window.location.pathname !== '/auth/profile-setup') {
              window.location.href = '/auth/profile-setup';
              return;
            }
          } else {
            console.log("No initial profile found for", sessionUser.id);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    userRole,
    loading,
    isAdmin,
    setCurrentUser,
    setUserRole,
    setIsAdmin
  };
};
