
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { CaseReplyProfile } from "@/types";

export function useCaseDetails() {
  const { currentUser, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = userRole === 'admin';
  
  // Process profile data to handle errors
  const safeProfileData = (profile: any): CaseReplyProfile => {
    // If there's an error or profile is missing, return a default profile with error flag
    if (!profile || profile.error) {
      return { 
        role: "unknown", 
        error: true 
      };
    }
    
    // Return valid profile data
    return {
      username: profile.username,
      role: profile.role,
      avatar_url: profile.avatar_url
    };
  };

  // Get case details including replies
  const fetchCaseDetails = async (caseId: string) => {
    if (!currentUser) {
      console.log("[case-details] No current user, cannot fetch case details");
      return null;
    }
    
    setIsLoading(true);
    console.log(`[case-details] Fetching case details for case ${caseId}, user ${currentUser.id}, isAdmin: ${isAdmin}`);
    
    try {
      // Build the query step by step for better debugging
      let caseQuery = supabase
        .from('cases')
        .select(`
          *,
          purchases(*),
          tickets(*)
        `)
        .eq('id', caseId);
      
      // Apply user filtering only for non-admin users
      if (!isAdmin) {
        console.log(`[case-details] Non-admin user, filtering by user_id: ${currentUser.id}`);
        caseQuery = caseQuery.eq('user_id', currentUser.id);
      } else {
        console.log(`[case-details] Admin user, no user_id filtering applied`);
      }
      
      const { data: caseData, error: caseError } = await caseQuery.maybeSingle();
      
      if (caseError) {
        console.error("[case-details] Error fetching case:", caseError);
        return null;
      }
      
      if (!caseData) {
        console.log(`[case-details] No case found with ID ${caseId} for user ${currentUser.id}`);
        return null;
      }
      
      console.log(`[case-details] Case found:`, caseData);
      
      // Get case replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('case_replies')
        .select(`*`)
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        console.error("[case-details] Error fetching case replies:", repliesError);
        return { ...caseData, replies: [] };
      }
      
      if (!repliesData || repliesData.length === 0) {
        console.log(`[case-details] No replies found for case ${caseId}`);
        return { ...caseData, replies: [] };
      }
      
      // Get user profiles for replies
      const processedReplies = await enrichRepliesWithProfiles(repliesData);
      
      // Return the combined data
      const result = { 
        ...caseData, 
        replies: processedReplies
      };
      
      console.log(`[case-details] Successfully fetched case details with ${processedReplies.length} replies`);
      return result;
    } catch (error) {
      console.error("[case-details] Error in fetchCaseDetails:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to enrich replies with profiles
  const enrichRepliesWithProfiles = async (repliesData: any[]) => {
    // Get user profiles for the replies in a separate query
    const userIds = Array.from(new Set(repliesData.map(reply => reply.user_id).filter(Boolean)));
    
    // Only fetch profiles if there are user IDs
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      console.log(`[case-details] Fetching profiles for users:`, userIds);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("[case-details] Error fetching user profiles:", profilesError);
      } else {
        // Create a map of user_id to profile data
        profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});
        console.log(`[case-details] Fetched ${Object.keys(profilesMap).length} user profiles`);
      }
    }
    
    // Process replies to ensure profile data is safe
    const processedReplies = repliesData.map(reply => ({
      ...reply,
      profiles: safeProfileData(profilesMap[reply.user_id])
    }));
    
    return processedReplies;
  };

  return {
    fetchCaseDetails,
    isLoading,
    safeProfileData
  };
}
