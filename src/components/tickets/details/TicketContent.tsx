
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import RateTicketDialog from "../RateTicketDialog";
import ReportTicketDialog from "../ReportTicketDialog";

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

  // Calculate if user can rate ticket (purchased, past kickoff, not seller)
  const canRate = alreadyPurchased && isPastKickoff && !isSeller && currentUser;
  
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
              alreadyPurchased={alreadyPurchased}
              canRate={canRate}
              canReport={canReport}
              purchaseLoading={purchaseLoading}
              onPurchase={onPurchase}
              isSeller={isSeller}
              isPastKickoff={isPastKickoff}
              currentUser={currentUser}
              price={ticket.price}
              isFree={ticket.is_free}
              openRateDialog={() => setRateDialogOpen(true)}
              openReportDialog={() => setReportDialogOpen(true)}
            />
          </div>
        </div>
      </CardContent>
      
      {/* Dialogs */}
      {canRate && purchaseId && (
        <RateTicketDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          ticketId={ticket.id}
          sellerId={ticket.seller_id}
          buyerId={currentUser?.id}
          purchaseId={purchaseId}
          onSuccess={() => {}} // Add an empty onSuccess callback
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
