
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTicketActions = () => {
  const { toast } = useToast();

  const toggleTicketVisibility = useCallback(async (ticketId: string, isHidden: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ is_hidden: isHidden })
        .eq("id", ticketId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: isHidden ? "Ticket has been hidden." : "Ticket is now visible."
      });
      
      return true;
    } catch (err: any) {
      console.error("Error updating ticket visibility:", err);
      toast({
        title: "Error",
        description: "Failed to update ticket visibility.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);
  
  const markTicketAsExpired = useCallback(async (ticketId: string, isExpired: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ is_expired: isExpired })
        .eq("id", ticketId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: isExpired 
          ? "Ticket has been marked as expired." 
          : "Ticket has been restored to active status."
      });
      
      return true;
    } catch (err: any) {
      console.error("Error updating ticket expiration:", err);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    toggleTicketVisibility,
    markTicketAsExpired
  };
};
