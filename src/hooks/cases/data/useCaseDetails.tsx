
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
    if (!currentUser) return null;
    
    setIsLoading(true);
    
    try {
      // Get the case with appropriate filtering based on user role
      let caseQuery = supabase
        .from('cases')
        .select(`
          *,
          purchases(*),
          tickets(*)
        `)
        .eq('id', caseId);
      
      // If not admin, only allow viewing own cases
      if (!isAdmin) {
        caseQuery = caseQuery.eq('user_id', currentUser.id);
      }
      
      const { data: caseData, error: caseError } = await caseQuery.single();
      
      if (caseError) {
        console.error("Error fetching case:", caseError);
        return null;
      }
      
      // Get case replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('case_replies')
        .select(`*`)
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        console.error("Error fetching case replies:", repliesError);
        return { ...caseData, replies: [] };
      }
      
      if (!repliesData) {
        return { ...caseData, replies: [] };
      }
      
      // Get user profiles for replies
      const processedReplies = await enrichRepliesWithProfiles(repliesData);
      
      // Return the combined data
      return { 
        ...caseData, 
        replies: processedReplies
      };
    } catch (error) {
      console.error("Error in fetchCaseDetails:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to enrich replies with profiles
  const enrichRepliesWithProfiles = async (repliesData: any[]) => {
    // Get user profiles for the replies in a separate query
    const userIds = Array.from(new Set(repliesData.map(reply => reply.user_id) || []));
    
    // Only fetch profiles if there are user IDs
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, role, avatar_url')
        .in('id', userIds);
        
      // Create a map of user_id to profile data
      profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
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
