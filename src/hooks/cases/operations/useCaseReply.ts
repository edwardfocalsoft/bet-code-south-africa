
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useCaseReply = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Add a reply to a case
  const addReply = async (caseId: string, content: string) => {
    if (!currentUser || !content.trim()) {
      toast.error("Please provide a valid reply");
      return false;
    }

    setIsLoading(true);
    console.log(`[case-reply] Starting reply creation for case ${caseId} by user ${currentUser.id}`);

    try {
      // First, get the case information to know who to notify
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('user_id, title, case_number')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error("[case-reply] Error fetching case for notification:", caseError);
        throw new Error("Failed to fetch case data");
      }

      const { data, error } = await supabase
        .from('case_replies')
        .insert({
          case_id: caseId,
          user_id: currentUser.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error("[case-reply] Error creating reply:", error);
        throw error;
      }

      console.log(`[case-reply] Reply created successfully with ID: ${data.id}`);
      toast.success("Reply added successfully!");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Notify the case creator if they're not the one replying
      if (caseData && caseData.user_id !== currentUser.id) {
        try {
          console.log(`[case-reply] Creating notification for case creator ${caseData.user_id}`);
          
          const caseRef = caseData.case_number || `Case #${caseId.substring(0,8)}`;
          const notifResult = await createNotification(
            caseData.user_id,
            `New Reply: ${caseRef}`,
            `You have a new reply on your case: ${caseData.title}`,
            "case",
            caseId
          );
          
          console.log(`[case-reply] Notification created:`, notifResult ? "Success" : "Failed");
        } catch (notifError) {
          console.error("[case-reply] Failed to create reply notification:", notifError);
          // Don't throw here - we want the reply to succeed even if notification fails
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("[case-reply] Error in reply creation process:", error);
      toast.error("Failed to add reply: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
      console.log(`[case-reply] Reply creation process completed for case ${caseId}`);
    }
  };

  return {
    addReply,
    isLoading
  };
};
