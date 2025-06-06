
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTicketNotifications } from "./useTicketNotifications";
import { toast } from "sonner";
import { BettingSite } from "@/types";

export interface TicketFormData {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  bettingSite: BettingSite;
  kickoffTime: Date;
  odds?: number;
  ticketCode: string;
}

interface TicketData {
  title: string;
  description: string;
  bettingSite: BettingSite;
  numberOfLegs: number;
  price: number;
  isFree: boolean;
  odds: string;
  date: Date;
  time: string;
  ticketCode: string;
}

export const useTicketForm = () => {
  const [loading, setLoading] = useState(false);
  const [isCheckingTicketCode, setIsCheckingTicketCode] = useState(false);
  const [step, setStep] = useState(1);
  const { toast: uiToast } = useToast();
  const { notifySubscribersOfNewTicket } = useTicketNotifications();

  const [ticketData, setTicketData] = useState<TicketData>({
    title: "",
    description: "",
    bettingSite: "Betway" as BettingSite,
    numberOfLegs: 2,
    price: 0,
    isFree: false,
    odds: "",
    date: new Date(),
    time: "",
    ticketCode: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    bettingSite: "",
    numberOfLegs: "",
    price: "",
    odds: "",
    date: "",
    time: "",
    ticketCode: "",
  });

  const validateStep1 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!ticketData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else {
      newErrors.title = "";
    }

    if (!ticketData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else {
      newErrors.description = "";
    }

    if (!ticketData.bettingSite) {
      newErrors.bettingSite = "Betting site is required";
      isValid = false;
    } else {
      newErrors.bettingSite = "";
    }

    if (ticketData.numberOfLegs < 2) {
      newErrors.numberOfLegs = "Must have at least 2 legs";
      isValid = false;
    } else {
      newErrors.numberOfLegs = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateTicketCodeUniqueness = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    
    setIsCheckingTicketCode(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("id")
        .eq("ticket_code", code)
        .limit(1);

      if (error) {
        console.error("Error checking ticket code:", error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error("Error validating ticket code:", error);
      return false;
    } finally {
      setIsCheckingTicketCode(false);
    }
  };

  const validateStep2 = async () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!ticketData.isFree && ticketData.price <= 0) {
      newErrors.price = "Price must be greater than 0 for paid tickets";
      isValid = false;
    } else {
      newErrors.price = "";
    }

    if (!ticketData.odds.trim() || parseFloat(ticketData.odds) <= 0) {
      newErrors.odds = "Valid odds are required";
      isValid = false;
    } else {
      newErrors.odds = "";
    }

    if (!ticketData.date) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      newErrors.date = "";
    }

    if (!ticketData.time) {
      newErrors.time = "Time is required";
      isValid = false;
    } else {
      newErrors.time = "";
    }

    if (!ticketData.ticketCode.trim()) {
      newErrors.ticketCode = "Ticket code is required";
      isValid = false;
    } else {
      const isUnique = await validateTicketCodeUniqueness(ticketData.ticketCode);
      if (!isUnique) {
        newErrors.ticketCode = "This ticket code is already in use";
        isValid = false;
      } else {
        newErrors.ticketCode = "";
      }
    }

    // Validate kickoff time is in the future
    if (ticketData.date && ticketData.time) {
      const kickoffTime = new Date(ticketData.date);
      const [hours, minutes] = ticketData.time.split(':').map(Number);
      kickoffTime.setHours(hours, minutes);
      
      if (kickoffTime <= new Date()) {
        newErrors.date = "Kickoff time must be in the future";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

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
        betting_site: formData.bettingSite as BettingSite,
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
        betting_site: formData.bettingSite as BettingSite,
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
    ticketData,
    setTicketData,
    errors,
    validateStep1,
    validateStep2,
    step,
    setStep,
    isCheckingTicketCode,
    validateTicketCodeUniqueness,
  };
};
