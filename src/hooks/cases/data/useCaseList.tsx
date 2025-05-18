
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export function useCaseList() {
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [isLoading, setIsLoading] = useState(false);
  
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
        
        // Fetch profiles in a separate query to enrich cases
        const enrichedCases = await enrichCasesWithProfiles(casesData);
        
        return enrichedCases;
      } catch (error) {
        console.error("Error in userCases query:", error);
        return [];
      }
    },
    enabled: Boolean(currentUser || isAdmin)  // Enable even if only admin role is present
  });

  // Helper function to enrich cases with profile data
  const enrichCasesWithProfiles = async (casesData: any[]) => {
    // Get user profiles in a separate query to avoid foreign key issues
    const userIds = Array.from(new Set(casesData.map(c => c.user_id)));
    
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email, role, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      } else {
        console.log("Profiles fetched:", profilesData?.length || 0);
        // Create a map of user_id to profile data
        profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});
      }
    }
    
    // Attach profile data to cases
    const enrichedCases = casesData.map((caseItem: any) => ({
      ...caseItem,
      profiles: profilesMap[caseItem.user_id] || { error: true }
    }));
    
    console.log("Enriched cases:", enrichedCases.length);
    return enrichedCases;
  };

  return {
    userCases,
    refetchCases,
    isCasesLoading,
    isLoading
  };
}
