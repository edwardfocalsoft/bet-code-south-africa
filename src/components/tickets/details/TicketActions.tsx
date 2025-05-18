
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Star, Flag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  hasRated?: boolean;
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
  openReportDialog,
  hasRated = false
}) => {
  return (
    <div className="mt-6 space-y-4">
      {!alreadyPurchased && !isSeller && (
        <div className="flex justify-between items-center">
          <span className="font-medium">
            Want this ticket?
          </span>
          <Button 
            className="bg-betting-green hover:bg-betting-green-dark" 
            onClick={onPurchase}
            disabled={purchaseLoading}
          >
            {purchaseLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isFree ? "Get Free Ticket" : "Buy Now"
            )}
          </Button>
        </div>
      )}
      
      {alreadyPurchased && (
        <div className="flex flex-wrap gap-3 items-center justify-end">
          {!isPastKickoff && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pending Result
            </Badge>
          )}
          
          {isPastKickoff && !isSeller && (
            <div className="flex gap-2 items-center">
              {canRate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openRateDialog}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3 text-yellow-500" />
                  Rate Ticket
                </Button>
              )}
              
              {hasRated && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Already Rated
                </Button>
              )}
              
              {canReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openReportDialog}
                  className="flex items-center gap-1"
                >
                  <Flag className="h-3 w-3 text-red-500" />
                  Report Issue
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketActions;
