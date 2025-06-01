
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useCaseCreate = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new case
  const createCase = async (caseData: {
    title: string;
    description: string;
    ticket_id?: string;
    purchase_id?: string;
  }) => {
    if (!currentUser) {
      toast.error("You must be logged in to create a case");
      return false;
    }

    setIsLoading(true);
    console.log(`[case-create] Starting case creation for user ${currentUser.id}`);

    try {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: currentUser.id,
          title: caseData.title,
          description: caseData.description,
          ticket_id: caseData.ticket_id || null,
          purchase_id: caseData.purchase_id || null,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error("[case-create] Error creating case:", error);
        throw error;
      }

      console.log(`[case-create] Case created successfully with ID: ${data.id}`);
      toast.success("Support case created successfully!");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      
      return data;
    } catch (error: any) {
      console.error("[case-create] Error in case creation process:", error);
      toast.error("Failed to create case: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
      console.log(`[case-create] Case creation process completed`);
    }
  };

  return {
    createCase,
    isLoading
  };
};
