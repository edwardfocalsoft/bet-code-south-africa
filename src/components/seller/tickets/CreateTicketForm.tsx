import React, { useState } from "react";
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
  
  // Single ticket form
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
  
  // Multi ticket form
  const {
    formData: multiTicketData,
    addTicket,
    removeTicket,
    updateTicket,
    addScannedCode,
    validateTicketCodeUniqueness,
    isScanning,
    setIsScanning
  } = useMultiTicketForm();
  
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
      
      // Check ticket code uniqueness
      const isUnique = await validateTicketCodeUniqueness(ticket.ticketCode);
      if (!isUnique) {
        toast.error(`Ticket code ${ticket.ticketCode} is already in use`);
        return false;
      }
      
      // Check if kickoff time is in the future
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
        // Handle multi-ticket submission
        const isValid = await validateMultiTickets();
        if (!isValid) return;
        
        console.log('[CreateTicketForm] Creating multiple tickets...');
        
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
        
        const { data, error } = await supabase
          .from("tickets")
          .insert(ticketsToInsert)
          .select('id, title');
        
        if (error) {
          console.error('[CreateTicketForm] Error creating multiple tickets:', error);
          throw error;
        }
        
        console.log('[CreateTicketForm] Multiple tickets created successfully:', data);
        
        // Notify subscribers for each created ticket
        if (data && data.length > 0) {
          console.log('[CreateTicketForm] Starting notification process for multiple tickets');
          try {
            const notificationPromises = data.map(ticket => {
              console.log(`[CreateTicketForm] Queuing notification for ticket: ${ticket.id} - ${ticket.title}`);
              return notifySubscribersOfNewTicket(currentUser.id, ticket.id, ticket.title);
            });
            
            const results = await Promise.allSettled(notificationPromises);
            
            let successCount = 0;
            let errorCount = 0;
            
            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                successCount++;
                console.log(`[CreateTicketForm] Notification successful for ticket ${index + 1}`);
              } else {
                errorCount++;
                console.error(`[CreateTicketForm] Notification failed for ticket ${index + 1}:`, result.reason);
              }
            });
            
            console.log(`[CreateTicketForm] Notification summary: ${successCount} successful, ${errorCount} failed`);
          } catch (notificationError) {
            console.error('[CreateTicketForm] Error in batch notifications:', notificationError);
          }
        }
        
        toast.success(`${multiTicketData.tickets.length} tickets created successfully!`, {
          description: "Your tickets have been published and subscribers have been notified.",
        });
      } else {
        // Handle single ticket submission
        console.log('[CreateTicketForm] Creating single ticket...');
        
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
        
        console.log('[CreateTicketForm] Inserting ticket data:', ticketDataForDb);
        
        const { data, error } = await supabase
          .from("tickets")
          .insert(ticketDataForDb)
          .select('id')
          .single();
        
        if (error) {
          console.error('[CreateTicketForm] Error creating single ticket:', error);
          throw error;
        }
        
        console.log('[CreateTicketForm] Single ticket created successfully:', data);
        
        // Notify subscribers about the new ticket
        if (data?.id) {
          console.log('[CreateTicketForm] Starting notification process for single ticket:', data.id);
          try {
            await notifySubscribersOfNewTicket(currentUser.id, data.id, ticketData.title);
            console.log('[CreateTicketForm] Single ticket notification completed successfully');
          } catch (notificationError) {
            console.error('[CreateTicketForm] Error notifying subscribers for single ticket:', notificationError);
          }
        } else {
          console.error('[CreateTicketForm] No ticket ID returned from single ticket creation');
        }
        
        toast.success("Ticket created successfully!", {
          description: "Your ticket has been published and subscribers have been notified.",
        });
      }
      
      navigate(`/seller/tickets`);
    } catch (error: any) {
      console.error('[CreateTicketForm] Error in ticket creation process:', error);
      toast.error("Error creating tickets", {
        description: error.message || "Failed to create tickets. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert optional FormErrors to required string errors for step components
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
      <div className="mb-8 bg-betting-dark-gray p-4 rounded-lg space-y-4">
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
        <div className="space-y-6">
          <MultiTicketForm
            tickets={multiTicketData.tickets}
            onAddTicket={addTicket}
            onRemoveTicket={removeTicket}
            onUpdateTicket={updateTicket}
            onCodeScanned={addScannedCode}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || multiTicketData.tickets.length === 0}
              className="bg-betting-green hover:bg-betting-green-dark"
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
