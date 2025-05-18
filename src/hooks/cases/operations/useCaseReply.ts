
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
    if (!currentUser) {
      toast.error("You must be logged in to add a reply");
      return null;
    }

    setIsLoading(true);
    console.log(`[case-reply] Starting reply process for case ${caseId} by user ${currentUser.id}`);

    try {
      // First, fetch the case to verify the current user has permissions
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id, user_id, purchase_id, title')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error("[case-reply] Error fetching case:", caseError);
        throw new Error("Failed to verify case access");
      }

      console.log(`[case-reply] Case data fetched. Case creator: ${caseData.user_id}`);

      // Now add the reply in a transaction
      const { data: newReply, error } = await supabase
        .from('case_replies')
        .insert({
          case_id: caseId,
          user_id: currentUser.id,
          content
        })
        .select()
        .single();

      if (error) {
        console.error("[case-reply] Error adding reply:", error);
        throw error;
      }

      console.log(`[case-reply] Reply added successfully with ID: ${newReply.id}`);

      // Update the case's updated_at timestamp
      const { error: updateError } = await supabase
        .from('cases')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', caseId);
        
      if (updateError) {
        console.error("[case-reply] Error updating case timestamp:", updateError);
      }

      toast.success("Reply added successfully");
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Create notification based on who replied
      try {
        const isAdmin = currentUser.role === 'admin';
        console.log(`[case-reply] Creating notification. User role: ${currentUser.role}, isAdmin: ${isAdmin}`);
        
        if (isAdmin) {
          // Admin replied, notify the case creator
          console.log(`[case-reply] Admin replied to case, notifying user ${caseData.user_id}`);
          const notifResult = await createNotification(
            caseData.user_id,
            "New Reply to Your Case",
            "An admin has replied to your support case.",
            "case",
            caseId
          );
          
          console.log(`[case-reply] Notification to user created:`, notifResult ? "Success" : "Failed");
        } else {
          // User replied, notify admins
          console.log(`[case-reply] User replied to case, fetching admins`);
          const { data: admins, error: adminsError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');
            
          if (adminsError) {
            console.error("[case-reply] Error fetching admins:", adminsError);
            throw new Error("Failed to fetch admins for notification");
          }
            
          if (admins && admins.length > 0) {
            console.log(`[case-reply] Found ${admins.length} admins to notify`);
            // Create notification for each admin
            for (const admin of admins) {
              console.log(`[case-reply] Creating notification for admin ${admin.id}`);
              try {
                const notifResult = await createNotification(
                  admin.id,
                  "New Reply to Support Case",
                  `${currentUser.username || 'A user'} has replied to a support case: ${caseData.title || 'Case #' + caseId}`,
                  "case",
                  caseId
                );
                console.log(`[case-reply] Notification to admin ${admin.id} created:`, notifResult ? "Success" : "Failed");
              } catch (adminNotifError) {
                console.error(`[case-reply] Error creating notification for admin ${admin.id}:`, adminNotifError);
                // Continue with other admins even if one fails
              }
            }
          } else {
            console.warn("[case-reply] No admins found to notify");
          }
        }
      } catch (notifError) {
        console.error("[case-reply] Failed to create reply notification:", notifError);
        // Don't throw here - we want the reply to succeed even if notification fails
      }
      
      return newReply;
    } catch (error: any) {
      console.error("[case-reply] Error in reply process:", error);
      toast.error("Failed to add reply: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
      console.log(`[case-reply] Reply process completed for case ${caseId}`);
    }
  };

  return {
    addReply,
    isLoading
  };
};
