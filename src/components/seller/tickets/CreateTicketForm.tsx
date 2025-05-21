
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
import TicketPreview from "./form-steps/TicketPreview";
import { useTicketForm } from "@/hooks/seller/useTicketForm";

const CreateTicketForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ticketData, setTicketData, errors, validateStep1, validateStep2, step, setStep, isCheckingTicketCode } = useTicketForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  
  const handleNextStep = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setValidatingStep(true);
      const isValid = await validateStep2();
      setValidatingStep(false);
      
      if (isValid) {
        handleSubmit();
      }
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const showTicketPreview = async () => {
    setValidatingStep(true);
    const isValid = await validateStep2();
    setValidatingStep(false);
    
    if (isValid) {
      setPreviewOpen(true);
    }
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
          ticket_code: ticketData.ticketCode
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
          isSubmitting={isSubmitting || validatingStep}
          showPreview={showTicketPreview}
          isCheckingTicketCode={isCheckingTicketCode}
        />
      )}
      
      <TicketPreview 
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        ticketData={ticketData}
      />
    </>
  );
};

export default CreateTicketForm;
