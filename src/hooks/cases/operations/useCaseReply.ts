
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

    try {
      // First, fetch the case to verify the current user has permissions
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id, user_id, purchase_id')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error("Error fetching case:", caseError);
        throw new Error("Failed to verify case access");
      }

      // Now add the reply
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
        console.error("Error details:", error);
        throw error;
      }

      // Update the case's updated_at timestamp
      await supabase
        .from('cases')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', caseId);

      toast.success("Reply added successfully");
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Create notification based on who replied
      try {
        const isAdmin = currentUser.role === 'admin';
        
        if (isAdmin) {
          // Admin replied, notify the case creator
          console.log(`Admin replied to case, notifying user ${caseData.user_id}`);
          await createNotification(
            caseData.user_id,
            "New Reply to Your Case",
            "An admin has replied to your support case.",
            "case",
            caseId
          );
        } else {
          // User replied, notify admins
          const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');
            
          if (admins && admins.length > 0) {
            console.log(`User replied to case, notifying ${admins.length} admins`);
            // Create notification for each admin
            for (const admin of admins) {
              await createNotification(
                admin.id,
                "New Reply to Support Case",
                `${currentUser.username || 'A user'} has replied to a support case.`,
                "case",
                caseId
              );
            }
          }
        }
      } catch (notifError) {
        console.error("Failed to create reply notification:", notifError);
      }
      
      return newReply;
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addReply,
    isLoading
  };
};
