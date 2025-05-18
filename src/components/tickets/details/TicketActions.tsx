
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Flag, Star } from "lucide-react";

interface TicketActionsProps {
  alreadyPurchased: boolean;
  canRate: boolean;
  canReport: boolean;
  purchaseLoading: boolean;
  onPurchase: () => void;
  isSeller: boolean;
  isPastKickoff: boolean;
  currentUser: any;
  price: number;
  isFree: boolean;
  openRateDialog: () => void;
  openReportDialog: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  alreadyPurchased,
  canRate,
  canReport,
  purchaseLoading,
  onPurchase,
  isSeller,
  isPastKickoff,
  currentUser,
  price,
  isFree,
  openRateDialog,
  openReportDialog
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-between">
      {alreadyPurchased ? (
        <div className="flex gap-3">
          {canRate && (
            <Button 
              variant="outline" 
              className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              onClick={openRateDialog}
            >
              <Star className="h-4 w-4 mr-2" />
              Rate this Ticket
            </Button>
          )}
          
          {canReport && (
            <Button 
              variant="outline" 
              className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
              onClick={openReportDialog}
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
               isFree ? "Get for Free" : "Purchase for R" + price}
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
  );
};

export default TicketActions;
