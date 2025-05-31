
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TicketInfoStep from "./form-steps/TicketInfoStep";
import TicketDetailsStep from "./form-steps/TicketDetailsStep";
import ProgressStepper from "./form-steps/ProgressStepper";
import TicketPreview from "./form-steps/TicketPreview";
import MultiTicketForm from "./MultiTicketForm";
import { useTicketForm } from "@/hooks/seller/useTicketForm";
import { useMultiTicketForm } from "@/hooks/seller/useMultiTicketForm";
import { useTicketNotifications } from "@/hooks/seller/useTicketNotifications";

const CreateTicketForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const { notifySubscribersOfNewTicket } = useTicketNotifications();
  
  const {
    formData: multiTicketData,
    addTicket,
    removeTicket,
    updateTicket,
    addScannedCode,
    validateTicketCodeUniqueness,
    isScanning,
    setIsScanning,
    startCamera,
    stopCamera,
    videoRef
  } = useMultiTicketForm();
  
  const { 
    ticketData, 
    setTicketData, 
    errors, 
    validateStep1, 
    validateStep2, 
    step, 
    setStep, 
    isCheckingTicketCode 
  } = useTicketForm();
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  
  const handleModeToggle = (checked: boolean) => {
    setIsMultiMode(checked);
    if (checked && multiTicketData.tickets.length === 0) {
      addTicket();
    }
  };
  
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
  
  const validateMultiTickets = async () => {
    if (multiTicketData.tickets.length === 0) {
      toast.error("Please add at least one ticket");
      return false;
    }
    
    for (const ticket of multiTicketData.tickets) {
      if (!ticket.title.trim()) {
        toast.error("All tickets must have a title");
        return false;
      }
      if (!ticket.description.trim()) {
        toast.error("All tickets must have a description");
        return false;
      }
      if (!ticket.bettingSite) {
        toast.error("All tickets must have a betting site selected");
        return false;
      }
      if (!ticket.ticketCode.trim()) {
        toast.error("All tickets must have a ticket code");
        return false;
      }
      if (!ticket.odds.trim()) {
        toast.error("All tickets must have odds");
        return false;
      }
      if (ticket.numberOfLegs < 2) {
        toast.error("All tickets must have at least 2 legs");
        return false;
      }
      if (!ticket.isFree && ticket.price <= 0) {
        toast.error("Paid tickets must have a valid price");
        return false;
      }
      
      const isUnique = await validateTicketCodeUniqueness(ticket.ticketCode);
      if (!isUnique) {
        toast.error(`Ticket code ${ticket.ticketCode} is already in use`);
        return false;
      }
      
      const kickoffTime = new Date(ticket.date);
      const [hours, minutes] = ticket.time.split(':').map(Number);
      kickoffTime.setHours(hours, minutes);
      
      if (kickoffTime <= new Date()) {
        toast.error("All tickets must have a future kickoff time");
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!currentUser?.id) {
      toast.error("Authentication required", {
        description: "You must be logged in to create tickets",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isMultiMode) {
        const isValid = await validateMultiTickets();
        if (!isValid) return;
        
        const ticketsToInsert = multiTicketData.tickets.map(ticket => {
          const kickoffTime = new Date(ticket.date);
          const [hours, minutes] = ticket.time.split(':').map(Number);
          kickoffTime.setHours(hours, minutes);
          
          return {
            seller_id: currentUser.id,
            title: ticket.title,
            description: ticket.description,
            betting_site: ticket.bettingSite,
            price: ticket.isFree ? 0 : ticket.price,
            is_free: ticket.isFree,
            odds: parseFloat(ticket.odds),
            kickoff_time: kickoffTime.toISOString(),
            ticket_code: ticket.ticketCode
          };
        });
        
        console.log('[CreateTicketForm] Creating multiple tickets:', ticketsToInsert.length);
        
        const { data, error } = await supabase
          .from("tickets")
          .insert(ticketsToInsert)
          .select('id, title');
        
        if (error) throw error;
        
        console.log('[CreateTicketForm] Tickets created successfully:', data?.length);
        
        // Notify subscribers for each ticket
        if (data && data.length > 0) {
          console.log('[CreateTicketForm] Starting notification process for', data.length, 'tickets');
          let totalNotifications = 0;
          
          for (const ticket of data) {
            try {
              const result = await notifySubscribersOfNewTicket(currentUser.id, ticket.id, ticket.title);
              totalNotifications += result.count || 0;
              console.log(`[CreateTicketForm] Notifications sent for ticket ${ticket.title}:`, result.count);
            } catch (notificationError) {
              console.error(`[CreateTicketForm] Failed to notify subscribers for ticket ${ticket.title}:`, notificationError);
              // Continue with other notifications even if one fails
            }
          }
          
          console.log(`[CreateTicketForm] Total notifications sent: ${totalNotifications}`);
        }
        
        toast.success(`${multiTicketData.tickets.length} tickets created successfully!`);
      } else {
        const kickoffTime = new Date(ticketData.date);
        const [hours, minutes] = ticketData.time.split(':').map(Number);
        kickoffTime.setHours(hours, minutes);
        
        const ticketDataForDb = {
          seller_id: currentUser.id,
          title: ticketData.title,
          description: ticketData.description,
          betting_site: ticketData.bettingSite,
          price: ticketData.isFree ? 0 : ticketData.price,
          is_free: ticketData.isFree,
          odds: parseFloat(ticketData.odds),
          kickoff_time: kickoffTime.toISOString(),
          ticket_code: ticketData.ticketCode
        };
        
        console.log('[CreateTicketForm] Creating single ticket');
        
        const { data, error } = await supabase
          .from("tickets")
          .insert(ticketDataForDb)
          .select('id, title')
          .single();
        
        if (error) throw error;
        
        console.log('[CreateTicketForm] Ticket created successfully:', data);
        
        // Notify subscribers
        if (data?.id) {
          try {
            console.log('[CreateTicketForm] Starting notification process for single ticket');
            const result = await notifySubscribersOfNewTicket(currentUser.id, data.id, data.title);
            console.log(`[CreateTicketForm] Notifications sent: ${result.count} out of ${result.subscriberCount || 0} subscribers`);
          } catch (notificationError) {
            console.error('[CreateTicketForm] Failed to notify subscribers:', notificationError);
            // Don't fail the entire process if notifications fail
          }
        }
        
        toast.success("Ticket created successfully!");
      }
      
      navigate(`/seller/tickets`);
    } catch (error: any) {
      console.error('[CreateTicketForm] Error creating tickets:', error);
      toast.error("Error creating tickets", {
        description: error.message || "Failed to create tickets. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStep1Errors = () => ({
    title: errors.title || "",
    description: errors.description || "",
    bettingSite: errors.bettingSite || "",
    numberOfLegs: errors.numberOfLegs || "",
  });

  const getStep2Errors = () => ({
    price: errors.price || "",
    odds: errors.odds || "",
    date: errors.date || "",
    time: errors.time || "",
    ticketCode: errors.ticketCode || "",
  });

  return (
    <>
      <div className="mb-6 sm:mb-8 bg-betting-dark-gray sm:bg-betting-dark-gray p-0 sm:p-4 rounded-none sm:rounded-lg space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="multi-mode"
            checked={isMultiMode}
            onCheckedChange={handleModeToggle}
          />
          <Label htmlFor="multi-mode">Create Multiple Tickets</Label>
        </div>
        
        {!isMultiMode && <ProgressStepper currentStep={step} />}
      </div>
      
      {isMultiMode ? (
        <div className="space-y-4 sm:space-y-6">
          <MultiTicketForm
            tickets={multiTicketData.tickets}
            onAddTicket={addTicket}
            onRemoveTicket={removeTicket}
            onUpdateTicket={updateTicket}
            onCodeScanned={addScannedCode}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            startCamera={startCamera}
            stopCamera={stopCamera}
            videoRef={videoRef}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || multiTicketData.tickets.length === 0}
              className="w-full sm:w-auto bg-betting-green hover:bg-betting-green-dark"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Tickets...
                </>
              ) : (
                `Create ${multiTicketData.tickets.length} Tickets`
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {step === 1 && (
            <TicketInfoStep 
              ticketData={ticketData}
              setTicketData={setTicketData}
              errors={getStep1Errors()}
              onNext={handleNextStep}
            />
          )}
          
          {step === 2 && (
            <TicketDetailsStep
              ticketData={ticketData}
              setTicketData={setTicketData}
              errors={getStep2Errors()}
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
      )}
    </>
  );
};

export default CreateTicketForm;
