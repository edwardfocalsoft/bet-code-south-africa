
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

    try {
      // First, fetch the case to get the user_id for notification
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('user_id, title')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error("Error fetching case for notification:", caseError);
        // Continue with the update even if fetching the case failed
      }

      const { error } = await supabase
        .from('cases')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success(`Case status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Notify the case creator about the status change
      if (caseData && caseData.user_id) {
        try {
          console.log(`Creating notification for user ${caseData.user_id} about status update to ${status}`);
          await createNotification(
            caseData.user_id,
            "Case Status Updated",
            `Your case status has been updated to: ${status}`,
            "case",
            caseId
          );
        } catch (notifError) {
          console.error("Failed to create status update notification:", notifError);
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update status: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCaseStatus,
    isLoading
  };
};
