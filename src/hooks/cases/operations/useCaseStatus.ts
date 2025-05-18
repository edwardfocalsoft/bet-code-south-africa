
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
      console.log(`Attempting to update case ${caseId} to status: ${status}`);
      
      const { error } = await supabase
        .from('cases')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (error) {
        console.error("Error updating case status:", error);
        throw error;
      }

      toast.success(`Case status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
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
