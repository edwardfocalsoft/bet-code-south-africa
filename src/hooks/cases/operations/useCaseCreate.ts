
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useCaseCreate = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new case
  const createCase = async (data: {
    ticketId: string,
    purchaseId: string,
    title: string,
    description: string
  }) => {
    if (!currentUser) {
      toast.error("You must be logged in to report an issue");
      return null;
    }

    setIsLoading(true);

    try {
      const { data: newCase, error } = await supabase
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

      if (error) throw error;

      toast.success("Issue reported successfully");
      queryClient.invalidateQueries({ queryKey: ['user-cases', currentUser.id] });
      
      // Notify admins about the new case
      try {
        // Get all admin users
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');
          
        if (admins && admins.length > 0) {
          console.log(`Found ${admins.length} admins to notify about new case`);
          // Create notification for each admin
          for (const admin of admins) {
            console.log(`Creating notification for admin ${admin.id}`);
            await createNotification(
              admin.id,
              "New Support Case",
              `A new case has been opened: ${data.title}`,
              "case",
              newCase.id
            );
          }
        } else {
          console.log("No admins found to notify");
        }
      } catch (notifError) {
        console.error("Failed to create admin notifications:", notifError);
      }
      
      return newCase;
    } catch (error: any) {
      console.error("Error creating case:", error);
      toast.error("Failed to report issue: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCase,
    isLoading
  };
};
