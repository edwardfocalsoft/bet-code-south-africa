
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import TicketHeader from "./TicketHeader";

interface TicketContentProps {
  ticket: any;
  seller: any;
  isSeller: boolean;
  isPastKickoff: boolean;
  alreadyPurchased: boolean;
  currentUser: any;
  purchaseLoading: boolean;
  onPurchase: () => void;
}

const TicketContent: React.FC<TicketContentProps> = ({
  ticket,
  seller,
  isSeller,
  isPastKickoff,
  alreadyPurchased,
  currentUser,
  purchaseLoading,
  onPurchase
}) => {
  return (
    <Card className="betting-card mb-6">
      <CardContent className="pt-6">
        <TicketHeader 
          ticket={ticket} 
          isPastKickoff={isPastKickoff} 
          isSeller={isSeller}
          isAdmin={currentUser?.role === "admin"}
        />
        
        <div className="flex items-center gap-2 mb-8">
          <Badge className="bg-betting-dark-gray text-white">
            {ticket.betting_site}
          </Badge>
          
          {ticket.odds && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-betting-green" />
              <span>Odds: {Number(ticket.odds).toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none bg-betting-light-gray/5">
          <h3>Description</h3>
          <p>{ticket.description}</p>
          
          <div className="bg-betting-dark-gray p-4 rounded-lg mt-6 mb-6">
            <h3 className="mt-0">Ticket Code</h3>
            <p className="mb-0">
              {currentUser ? (
                alreadyPurchased ? ticket.ticket_code : "Content will be visible after purchase."
              ) : (
                "Please log in and purchase this ticket to view its content."
              )}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-betting-light-gray pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">
            {ticket.is_free ? (
              <span className="text-green-400">Free</span>
            ) : (
              <>R {Number(ticket.price).toFixed(2)}</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            className="bg-betting-green hover:bg-betting-green-dark"
            disabled={isPastKickoff || purchaseLoading || isSeller || alreadyPurchased}
            onClick={onPurchase}
          >
            {purchaseLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : alreadyPurchased ? (
              "Purchased"
            ) : ticket.is_free ? (
              "Get for Free"
            ) : (
              "Purchase Ticket"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketContent;
