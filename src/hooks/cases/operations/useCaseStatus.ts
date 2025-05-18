
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useCaseStatus = () => {
  const { currentUser, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = userRole === 'admin';

  // Update case status
  const updateCaseStatus = async (caseId: string, status: string) => {
    if (!currentUser || !isAdmin) {
      toast.error("You don't have permission to update case status");
      return false;
    }

    setIsLoading(true);
    console.log(`[case-status] Starting status update for case ${caseId} to ${status} by admin ${currentUser.id}`);

    try {
      // First, fetch the case to get the user_id for notification
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('user_id, title, case_number')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error("[case-status] Error fetching case for notification:", caseError);
        throw new Error("Failed to fetch case data");
      }
      
      console.log(`[case-status] Case data fetched. Case creator: ${caseData.user_id}`);

      const { error } = await supabase
        .from('cases')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (error) {
        console.error("[case-status] Error updating case status:", error);
        throw error;
      }

      console.log(`[case-status] Case status updated successfully to ${status}`);
      toast.success(`Case status updated to ${status}`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Notify the case creator about the status change
      if (caseData && caseData.user_id) {
        try {
          console.log(`[case-status] Creating notification for user ${caseData.user_id} about status update to ${status}`);
          
          const caseRef = caseData.case_number || `Case #${caseId.substring(0,8)}`;
          const notifResult = await createNotification(
            caseData.user_id,
            `Case Status Updated: ${caseRef}`,
            `Your case status has been updated to: ${status}`,
            "case",
            caseId
          );
          
          console.log(`[case-status] Notification to user created:`, notifResult ? "Success" : "Failed");
        } catch (notifError) {
          console.error("[case-status] Failed to create status update notification:", notifError);
          // Don't throw here - we want the status update to succeed even if notification fails
        }
      } else {
        console.warn("[case-status] No user_id found for case, cannot send notification");
      }
      
      return true;
    } catch (error: any) {
      console.error("[case-status] Error in status update process:", error);
      toast.error("Failed to update status: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
      console.log(`[case-status] Status update process completed for case ${caseId}`);
    }
  };

  return {
    updateCaseStatus,
    isLoading
  };
};
