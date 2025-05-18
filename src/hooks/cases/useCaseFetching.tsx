
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { CaseReplyProfile } from "@/types";

export const useCaseFetching = () => {
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

  // Get user cases with support for userId filter for admin
  const { data: userCases, refetch: refetchCases, isLoading: isCasesLoading } = useQuery({
    queryKey: ['user-cases', currentUser?.id, isAdmin],
    queryFn: async () => {
      try {
        console.log("Fetching cases, isAdmin:", isAdmin);
        
        // Start building the query
        let query = supabase
          .from('cases')
          .select(`
            *,
            purchases(*),
            tickets(*)
          `)
          .order('created_at', { ascending: false });
        
        // Extract any params from querystring for filtering (admin only)
        const urlParams = new URLSearchParams(window.location.search);
        const filterUserId = urlParams.get('userId');
        
        // If admin, get all cases, or filter by user_id if provided in URL
        if (isAdmin) {
          if (filterUserId) {
            query = query.eq('user_id', filterUserId);
          }
          // Admin gets all cases when no filter is applied
        } else if (currentUser) {
          // Non-admin users can only see their own cases
          query = query.eq('user_id', currentUser.id);
        } else {
          console.log("No user found, returning empty cases array");
          return [];
        }
        
        const { data: casesData, error } = await query;
        
        if (error) {
          console.error("Error fetching cases:", error);
          return [];
        }
        
        console.log("Cases fetched:", casesData?.length || 0);
        
        if (!casesData || casesData.length === 0) {
          console.log("No cases found in database");
          return [];
        }
        
        // Get user profiles in a separate query to avoid foreign key issues
        const userIds = Array.from(new Set(casesData.map(c => c.user_id)));
        
        let profilesMap: Record<string, any> = {};
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, email, role, avatar_url')
            .in('id', userIds);
            
          // Create a map of user_id to profile data
          profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
            map[profile.id] = profile;
            return map;
          }, {});
        }
        
        // Attach profile data to cases
        const enrichedCases = casesData.map((caseItem: any) => ({
          ...caseItem,
          profiles: profilesMap[caseItem.user_id] || { error: true }
        }));
        
        console.log("Enriched cases:", enrichedCases.length);
        return enrichedCases;
      } catch (error) {
        console.error("Error in userCases query:", error);
        return [];
      }
    },
    enabled: Boolean(currentUser || isAdmin)  // Enable even if only admin role is present
  });

  // Get case details including replies
  const fetchCaseDetails = async (caseId: string) => {
    if (!currentUser) return null;
    
    try {
      // Get the case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          purchases(*),
          tickets(*)
        `)
        .eq('id', caseId)
        .single();
      
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
      
      // Return the combined data
      return { 
        ...caseData, 
        replies: processedReplies
      };
    } catch (error) {
      console.error("Error in fetchCaseDetails:", error);
      return null;
    }
  };

  return {
    userCases,
    fetchCaseDetails,
    isLoading,
    isCasesLoading,
    refetchCases,
    safeProfileData
  };
};
