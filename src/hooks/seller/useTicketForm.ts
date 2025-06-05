
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTicketNotifications } from "./useTicketNotifications";
import { toast } from "sonner";

export interface TicketFormData {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  bettingSite: string;
  kickoffTime: Date;
  odds?: number;
  ticketCode: string;
}

export const useTicketForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { notifySubscribersOfNewTicket } = useTicketNotifications();

  const createTicket = async (formData: TicketFormData, sellerId: string) => {
    try {
      setLoading(true);
      
      console.log("[ticket-creation] Starting ticket creation process...");
      
      const ticketData = {
        title: formData.title,
        description: formData.description,
        seller_id: sellerId,
        price: formData.isFree ? 0 : formData.price,
        is_free: formData.isFree,
        betting_site: formData.bettingSite,
        kickoff_time: formData.kickoffTime.toISOString(),
        odds: formData.odds || null,
        ticket_code: formData.ticketCode,
        is_expired: false,
        is_hidden: false,
      };

      console.log("[ticket-creation] Creating ticket with data:", ticketData);

      const { data: ticket, error } = await supabase
        .from("tickets")
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        console.error("[ticket-creation] Error creating ticket:", error);
        throw error;
      }

      console.log("[ticket-creation] Ticket created successfully:", ticket);

      // Notify subscribers after successful ticket creation
      try {
        console.log("[ticket-creation] Starting notification process...");
        await notifySubscribersOfNewTicket(sellerId, ticket.id, ticket.title);
        console.log("[ticket-creation] Notification process completed");
      } catch (notificationError) {
        console.error("[ticket-creation] Notification error (non-blocking):", notificationError);
        // Don't throw here - ticket creation was successful, just log the notification error
        toast.error("Ticket created but failed to notify some subscribers");
      }

      toast.success("Ticket created successfully!");
      return ticket;
    } catch (error: any) {
      console.error("[ticket-creation] Error in createTicket:", error);
      uiToast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, formData: TicketFormData) => {
    try {
      setLoading(true);
      
      const ticketData = {
        title: formData.title,
        description: formData.description,
        price: formData.isFree ? 0 : formData.price,
        is_free: formData.isFree,
        betting_site: formData.bettingSite,
        kickoff_time: formData.kickoffTime.toISOString(),
        odds: formData.odds || null,
        ticket_code: formData.ticketCode,
        updated_at: new Date().toISOString(),
      };

      const { data: ticket, error } = await supabase
        .from("tickets")
        .update(ticketData)
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;

      toast.success("Ticket updated successfully!");
      return ticket;
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      uiToast({
        title: "Error",
        description: error.message || "Failed to update ticket",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTicket,
    updateTicket,
    loading,
  };
};
