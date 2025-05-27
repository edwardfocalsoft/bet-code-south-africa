
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BettingSite } from "@/types";

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

export const useTicketForm = (initialData?: Partial<TicketFormData>) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TicketFormData>({
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.bettingSite) {
      toast.error("Betting site is required");
      return false;
    }
    if (!formData.ticketCode.trim()) {
      toast.error("Ticket code is required");
      return false;
    }
    if (!formData.odds.trim()) {
      toast.error("Odds are required");
      return false;
    }
    if (formData.numberOfLegs < 2) {
      toast.error("Number of legs must be at least 2");
      return false;
    }
    if (!formData.isFree && formData.price <= 0) {
      toast.error("Price must be greater than 0 for paid tickets");
      return false;
    }
    return true;
  };

  const submitTicket = async (userId: string) => {
    if (!validateForm()) return false;
    
    setIsSubmitting(true);
    try {
      // Combine date and time for kickoff_time
      const kickoffDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      kickoffDateTime.setHours(parseInt(hours), parseInt(minutes));

      const ticketData = {
        seller_id: userId,
        title: formData.title,
        description: formData.description,
        betting_site: formData.bettingSite,
        price: formData.isFree ? 0 : formData.price,
        is_free: formData.isFree,
        odds: parseFloat(formData.odds),
        kickoff_time: kickoffDateTime.toISOString(),
        ticket_code: formData.ticketCode,
      };

      const { error } = await supabase
        .from('tickets')
        .insert(ticketData);

      if (error) throw error;

      toast.success("Ticket created successfully!");
      navigate('/seller/tickets');
      return true;
    } catch (error: any) {
      toast.error(`Error creating ticket: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    submitTicket,
    isSubmitting,
  };
};
