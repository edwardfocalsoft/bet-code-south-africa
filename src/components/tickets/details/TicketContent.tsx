import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  CircleDollarSign, 
  Share2, 
  Star, 
  AlertCircle,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShareTicket from "../ShareTicket";
import RateTicketDialog from "../RateTicketDialog";
import ReportTicketDialog from "../ReportTicketDialog";

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold mb-1">{ticket.title}</h1>
              <div className="flex gap-2">
                {!isSeller && (
                  <ShareTicket 
                    ticketId={ticket.id}
                    ticketTitle={ticket.title}
                  />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-betting-green hover:bg-betting-green-dark">
                {ticket.betting_site}
              </Badge>
              
              {isPastKickoff ? (
                <Badge variant="outline" className="text-gray-500 border-gray-500/30 bg-gray-500/10">
                  Event has started
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
                  Upcoming
                </Badge>
              )}
              
              {ticket.is_free && (
                <Badge className="bg-purple-600 hover:bg-purple-700">
                  Free
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-betting-green" />
                <span>{format(new Date(ticket.kickoff_time), 'PPP')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-betting-green" />
                <span>{format(new Date(ticket.kickoff_time), 'p')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-betting-green" />
                <span className="font-medium">
                  {ticket.is_free 
                    ? "Free" 
                    : `R${ticket.price ? Number(ticket.price).toFixed(2) : "0.00"}`}
                </span>
              </div>
              
              {ticket.odds && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-betting-green" />
                  <span className="font-medium">
                    Odds: {ticket.odds}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-betting-light-gray p-4 rounded-md mb-6 whitespace-pre-line">
              {ticket.description}
            </div>
            
            <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
              <h3 className="font-bold mb-2">Ticket Code</h3>
              {alreadyPurchased ? (
                <div className="font-mono bg-betting-dark-gray p-3 rounded-md text-green-400">
                  {ticket.ticket_code}
                </div>
              ) : (
                <div className="blur-sm bg-betting-dark-gray p-3 rounded-md text-gray-300 select-none">
                  ** Purchase to reveal ticket code **
                </div>
              )}
            </div>
            
            {isPastKickoff && ticket.event_results && (
              <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
                <h3 className="font-bold mb-2">Event Results</h3>
                <p>{ticket.event_results}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 justify-between">
              {alreadyPurchased ? (
                <div className="flex gap-3">
                  {canRate && (
                    <Button 
                      variant="outline" 
                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                      onClick={() => setRateDialogOpen(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate this Ticket
                    </Button>
                  )}
                  
                  {canReport && (
                    <Button 
                      variant="outline" 
                      className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                      onClick={() => setReportDialogOpen(true)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  className="bg-betting-green hover:bg-betting-green-dark"
                  onClick={onPurchase}
                  disabled={purchaseLoading || isSeller || isPastKickoff || !currentUser}
                >
                  {purchaseLoading ? (
                    <>
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      {isSeller ? "You own this ticket" : 
                       isPastKickoff ? "Event has started" :
                       !currentUser ? "Log in to purchase" : 
                       ticket.is_free ? "Get for Free" : "Purchase for R" + ticket.price}
                    </>
                  )}
                </Button>
              )}
              
              {isPastKickoff && !alreadyPurchased && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">
                    Event has started, ticket not available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <ShareTicket 
        ticketId={ticket.id}
        ticketTitle={ticket.title}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      
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
