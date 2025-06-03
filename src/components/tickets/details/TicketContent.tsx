
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import RateTicketDialog from "../RateTicketDialog";
import ReportTicketDialog from "../ReportTicketDialog";
import { supabase } from "@/integrations/supabase/client";

// Import our new components
import TicketHeader from "./TicketHeader";
import TicketMetadata from "./TicketMetadata";
import TicketDescription from "./TicketDescription";
import TicketCode from "./TicketCode";
import EventResults from "./EventResults";
import TicketActions from "./TicketActions";

interface TicketContentProps {
  ticket: any;
  seller: any;
  isSeller: boolean;
  isPastKickoff: boolean;
  alreadyPurchased: boolean;
  currentUser: any;
  purchaseLoading: boolean;
  onPurchase: () => void;
  purchaseId?: string;
}

const TicketContent: React.FC<TicketContentProps> = ({ 
  ticket, 
  seller, 
  isSeller,
  isPastKickoff,
  alreadyPurchased,
  currentUser,
  purchaseLoading,
  onPurchase,
  purchaseId
}) => {
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Check if the user has already rated this ticket
  useEffect(() => {
    if (currentUser && ticket && alreadyPurchased) {
      const checkExistingRating = async () => {
        try {
          const { data, error } = await supabase
            .from('ratings')
            .select('id')
            .eq('buyer_id', currentUser.id)
            .eq('ticket_id', ticket.id)
            .maybeSingle();
            
          if (!error && data) {
            setHasRated(true);
          } else {
            setHasRated(false);
          }
        } catch (err) {
          console.error("Error checking rating status:", err);
        }
      };
      
      checkExistingRating();
    }
  }, [currentUser, ticket, alreadyPurchased]);
  
  // Calculate if user can rate ticket (purchased, past kickoff, not seller, not rated yet)
  const canRate = alreadyPurchased && isPastKickoff && !isSeller && currentUser && !hasRated;
  
  // Calculate if user can report ticket (purchased, past kickoff)
  const canReport = alreadyPurchased && currentUser;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div>
            <TicketHeader 
              title={ticket.title}
              bettingSite={ticket.betting_site}
              isPastKickoff={isPastKickoff}
              isFree={ticket.is_free}
              isSeller={isSeller}
              ticketId={ticket.id}
              ticket={ticket}
              seller={seller}
            />
            
            <TicketMetadata 
              kickoffTime={ticket.kickoff_time}
              price={ticket.price}
              isFree={ticket.is_free}
              odds={ticket.odds}
            />
            
            <TicketDescription description={ticket.description} />
            
            <TicketCode 
              ticketCode={ticket.ticket_code}
              alreadyPurchased={alreadyPurchased}
            />
            
            <EventResults 
              eventResults={ticket.event_results} 
              isPastKickoff={isPastKickoff}
            />
            
            <TicketActions 
              ticket={ticket}
              seller={seller}
              currentUser={currentUser}
              onPurchase={onPurchase}
              purchaseLoading={purchaseLoading}
              alreadyPurchased={alreadyPurchased}
              isSeller={isSeller}
              isPastKickoff={isPastKickoff}
            />
          </div>
        </div>
      </CardContent>
      
      {/* Dialogs */}
      {(canRate || hasRated) && purchaseId && (
        <RateTicketDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          ticketId={ticket.id}
          sellerId={ticket.seller_id}
          buyerId={currentUser?.id}
          purchaseId={purchaseId}
          onSuccess={() => setHasRated(true)}
        />
      )}
      
      {canReport && purchaseId && (
        <ReportTicketDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          ticketId={ticket.id}
          purchaseId={purchaseId}
        />
      )}
    </Card>
  );
};

export default TicketContent;
