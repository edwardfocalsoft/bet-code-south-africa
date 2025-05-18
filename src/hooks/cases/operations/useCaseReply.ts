
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
      const { data: newReply, error } = await supabase
        .from('case_replies')
        .insert({
          case_id: caseId,
          user_id: currentUser.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Update the case's updated_at timestamp
      await supabase
        .from('cases')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', caseId);

      toast.success("Reply added successfully");
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
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
