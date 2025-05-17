
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TicketInfoStep from "./form-steps/TicketInfoStep";
import TicketDetailsStep from "./form-steps/TicketDetailsStep";
import ProgressStepper from "./form-steps/ProgressStepper";
import { useTicketForm } from "@/hooks/seller/useTicketForm";

const CreateTicketForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ticketData, setTicketData, errors, validateStep1, validateStep2, step, setStep } = useTicketForm();
  
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async () => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to create a ticket");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create a Date object with the selected date and time
      const kickoffTime = new Date(ticketData.date);
      const [hours, minutes] = ticketData.time.split(':').map(Number);
      kickoffTime.setHours(hours, minutes);
      
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          seller_id: currentUser.id,
          title: ticketData.title,
          description: ticketData.description,
          betting_site: ticketData.bettingSite,
          price: ticketData.isFree ? 0 : ticketData.price,
          is_free: ticketData.isFree,
          odds: parseFloat(ticketData.odds),
          kickoff_time: kickoffTime.toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Ticket created successfully!");
      navigate(`/seller/tickets`);
    } catch (error: any) {
      toast.error(`Error creating ticket: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 bg-betting-dark-gray p-4 rounded-lg">
        <ProgressStepper currentStep={step} />
      </div>
      
      {step === 1 && (
        <TicketInfoStep 
          ticketData={ticketData}
          setTicketData={setTicketData}
          errors={errors}
          onNext={handleNextStep}
        />
      )}
      
      {step === 2 && (
        <TicketDetailsStep
          ticketData={ticketData}
          setTicketData={setTicketData}
          errors={errors}
          onPrev={handlePrevStep}
          onSubmit={handleNextStep}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default CreateTicketForm;
