
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTicketForm } from "@/hooks/seller/useTicketForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { notifySubscribersAboutNewTicket } from "@/utils/notificationUtils";

interface TicketPreviewProps {
  onPrevious: () => void;
}

const TicketPreview: React.FC<TicketPreviewProps> = ({ onPrevious }) => {
  const { 
    ticketData, 
    setTicketData,
    setStep 
  } = useTicketForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Reset form by setting step back to 1
  const resetForm = () => {
    setTicketData({
      title: "",
      description: "",
      bettingSite: "Betway",
      price: 0,
      odds: "",
      ticketCode: "",
      isFree: false,
      // Fix the type here - using new Date() instead of empty string
      date: new Date(),
      time: ""
    });
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to create a ticket");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a Date object with the selected date and time
      const kickoffTime = new Date(ticketData.date);
      const [hours, minutes] = ticketData.time.split(':').map(Number);
      kickoffTime.setHours(hours, minutes);
      
      const { data: newTicket, error } = await supabase
        .from("tickets")
        .insert({
          seller_id: currentUser.id,
          title: ticketData.title,
          description: ticketData.description,
          price: ticketData.isFree ? 0 : ticketData.price,
          odds: parseFloat(ticketData.odds),
          ticket_code: ticketData.ticketCode,
          kickoff_time: kickoffTime.toISOString(),
          betting_site: ticketData.bettingSite, 
          is_free: ticketData.isFree
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Ticket created successfully!");
      
      // Notify subscribers about the new ticket
      if (newTicket) {
        const sellerName = currentUser.username || "A seller";
        notifySubscribersAboutNewTicket(
          currentUser.id, 
          newTicket.id, 
          ticketData.title,
          sellerName
        ).then(notifiedCount => {
          console.log(`[ticket-create] Notified ${notifiedCount} subscribers about new ticket`);
        });
      }
      
      resetForm();
      navigate("/seller/tickets");
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview Your Ticket</h2>
      <p className="text-muted-foreground">
        Review your ticket before publishing it to the marketplace.
      </p>

      <Card className="betting-card">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold">{ticketData.title}</h3>
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <div className="bg-betting-light-gray/30 px-2 py-1 rounded text-sm">{ticketData.bettingSite}</div>
              {ticketData.odds && <div className="bg-betting-green/10 text-betting-green px-2 py-1 rounded text-sm">Odds: {ticketData.odds}</div>}
              <div className="bg-betting-light-gray/30 px-2 py-1 rounded text-sm">
                {ticketData.date && ticketData.time ? `${ticketData.date.toLocaleDateString()} ${ticketData.time}` : "No kickoff time set"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <div className="bg-betting-light-gray/20 p-4 rounded whitespace-pre-wrap">
              {ticketData.description}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Ticket Code</h4>
            <div className="bg-betting-light-gray/20 p-4 rounded font-mono">
              {ticketData.ticketCode}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Price</h4>
            <div className="bg-betting-light-gray/20 p-4 rounded">
              {ticketData.isFree ? "Free Ticket" : `R${ticketData.price}`}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="bg-betting-green hover:bg-betting-green-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Ticket"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TicketPreview;
