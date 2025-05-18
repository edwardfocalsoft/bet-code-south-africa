
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

interface CreateCaseData {
  ticketId: string;
  purchaseId: string;
  title: string;
  description: string;
}

export const useCaseCreate = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new case
  const createCase = async (data: CreateCaseData) => {
    if (!currentUser) {
      toast.error("You must be logged in to create a case");
      return null;
    }

    setIsLoading(true);
    console.log(`[case-create] Starting case creation for ticket ${data.ticketId} by user ${currentUser.id}`);

    try {
      // Get the ticket details for additional context
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', data.ticketId)
        .single();

      if (ticketError) {
        console.error("[case-create] Error fetching ticket:", ticketError);
        // Continue with case creation even if ticket lookup fails
      } else {
        console.log("[case-create] Ticket data retrieved successfully");
      }

      // Insert the new case
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: currentUser.id,
          ticket_id: data.ticketId,
          purchase_id: data.purchaseId,
          title: data.title,
          description: data.description
        })
        .select()
        .single();

      if (caseError) {
        console.error("[case-create] Error creating case:", caseError);
        throw caseError;
      }

      console.log("[case-create] Case created successfully:", newCase);
      toast.success("Case submitted successfully");
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });

      // Fetch all admins to notify them about the new case
      try {
        console.log("[case-create] Fetching admins for notifications");
        const { data: admins, error: adminsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');

        if (adminsError) {
          console.error("[case-create] Error fetching admins:", adminsError);
          throw new Error("Failed to fetch admins for notification");
        }

        if (admins && admins.length > 0) {
          console.log(`[case-create] Found ${admins.length} admins to notify`);
          // Create notification for each admin
          for (const admin of admins) {
            console.log(`[case-create] Creating notification for admin ${admin.id}`);
            try {
              const notifResult = await createNotification(
                admin.id,
                "New Support Case",
                `A new case has been created: ${data.title}`,
                "case",
                newCase.id
              );
              console.log(`[case-create] Notification to admin ${admin.id} created:`, notifResult ? "Success" : "Failed");
            } catch (adminNotifError) {
              console.error(`[case-create] Error creating notification for admin ${admin.id}:`, adminNotifError);
              // Continue with other admins even if one fails
            }
          }
        } else {
          console.warn("[case-create] No admins found to notify");
        }
      } catch (notifError) {
        console.error("[case-create] Failed to notify admins:", notifError);
        // Don't throw here - case is already created successfully
      }

      return newCase;
    } catch (error: any) {
      console.error("[case-create] Error in case creation process:", error);
      toast.error("Failed to create case: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
      console.log("[case-create] Case creation process completed");
    }
  };

  return {
    createCase,
    isLoading
  };
};
