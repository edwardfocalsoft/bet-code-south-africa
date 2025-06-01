
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BettingSite } from "@/types";
import { useTicketNotifications } from "./useTicketNotifications";

interface TicketFormData {
  title: string;
  description: string;
  bettingSite: BettingSite;
  price: number;
  isFree: boolean;
  odds: string;
  date: Date;
  time: string;
  ticketCode: string;
  numberOfLegs: number;
}

interface FormErrors {
  title: string;
  description: string;
  bettingSite: string;
  numberOfLegs: string;
  price: string;
  odds: string;
  date: string;
  time: string;
  ticketCode: string;
}

export const useTicketForm = (initialData?: Partial<TicketFormData>) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [isCheckingTicketCode, setIsCheckingTicketCode] = useState(false);
  const { notifySubscribersOfNewTicket } = useTicketNotifications();
  
  const [ticketData, setTicketData] = useState<TicketFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    bettingSite: initialData?.bettingSite || "" as BettingSite,
    price: initialData?.price || 0,
    isFree: initialData?.isFree || false,
    odds: initialData?.odds || "",
    date: initialData?.date || new Date(),
    time: initialData?.time || "19:00",
    ticketCode: initialData?.ticketCode || "",
    numberOfLegs: initialData?.numberOfLegs || 0,
  });

  const updateField = (field: keyof TicketFormData, value: any) => {
    setTicketData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<FormErrors> = {};
    
    if (!ticketData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!ticketData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!ticketData.bettingSite) {
      newErrors.bettingSite = "Betting site is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = async (): Promise<boolean> => {
    const newErrors: Partial<FormErrors> = {};
    
    if (!ticketData.ticketCode.trim()) {
      newErrors.ticketCode = "Ticket code is required";
    } else {
      // Check if ticket code already exists
      setIsCheckingTicketCode(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("id")
          .eq("ticket_code", ticketData.ticketCode)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          newErrors.ticketCode = "This ticket code already exists";
        }
      } catch (error: any) {
        console.error("Error checking ticket code:", error);
        toast.error("Error validating ticket code");
      } finally {
        setIsCheckingTicketCode(false);
      }
    }
    
    if (!ticketData.odds.trim()) {
      newErrors.odds = "Odds are required";
    }
    if (ticketData.numberOfLegs < 2) {
      newErrors.numberOfLegs = "Number of legs must be at least 2";
    }
    if (!ticketData.isFree && ticketData.price <= 0) {
      newErrors.price = "Price must be greater than 0 for paid tickets";
    }

    // Check if kickoff time is in the future
    const kickoffTime = new Date(ticketData.date);
    const [hours, minutes] = ticketData.time.split(':');
    kickoffTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    if (kickoffTime <= now) {
      newErrors.date = "Kickoff time must be in the future";
      newErrors.time = "Please select a future time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitTicket = async (userId: string) => {
    const isValid = await validateStep2();
    if (!isValid) return false;
    
    setIsSubmitting(true);
    
    // Show loading toast
    toast.loading("Creating your betting ticket...");
    
    try {
      // Combine date and time for kickoff_time
      const kickoffDateTime = new Date(ticketData.date);
      const [hours, minutes] = ticketData.time.split(':');
      kickoffDateTime.setHours(parseInt(hours), parseInt(minutes));

      const ticketDataForDb = {
        seller_id: userId,
        title: ticketData.title,
        description: ticketData.description,
        betting_site: ticketData.bettingSite,
        price: ticketData.isFree ? 0 : ticketData.price,
        is_free: ticketData.isFree,
        odds: parseFloat(ticketData.odds),
        kickoff_time: kickoffDateTime.toISOString(),
        ticket_code: ticketData.ticketCode,
      };

      console.log('[useTicketForm] Creating ticket with data:', ticketDataForDb);

      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketDataForDb)
        .select('id, title')
        .single();

      if (error) {
        console.error('[useTicketForm] Error creating ticket:', error);
        throw error;
      }

      console.log('[useTicketForm] Ticket created successfully:', data);

      // Dismiss loading toast
      toast.dismiss();

      // Notify subscribers about the new ticket
      if (data?.id) {
        console.log('[useTicketForm] Starting notification process for ticket:', data.id);
        try {
          const result = await notifySubscribersOfNewTicket(userId, data.id, data.title);
          console.log('[useTicketForm] Notification process completed:', result);
          
          // Show success toast with notification info
          const notificationText = result.count > 0 
            ? ` (${result.count} subscribers notified)`
            : "";
          toast.success(`Betting ticket "${data.title}" created successfully!${notificationText}`);
        } catch (notificationError) {
          console.error('[useTicketForm] Error in notification process:', notificationError);
          // Still show success for ticket creation
          toast.success(`Betting ticket "${data.title}" created successfully!`);
          toast.warning("Some notifications may have failed to send");
        }
      } else {
        console.error('[useTicketForm] No ticket ID returned from database');
        toast.success("Betting ticket created successfully!");
      }

      navigate('/seller/tickets');
      return true;
    } catch (error: any) {
      console.error('[useTicketForm] Error creating ticket:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss();
      toast.error(`Failed to create ticket: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ticketData,
    setTicketData,
    formData: ticketData, // For backward compatibility
    updateField,
    submitTicket,
    isSubmitting,
    step,
    setStep,
    errors,
    validateStep1,
    validateStep2,
    isCheckingTicketCode,
  };
};
