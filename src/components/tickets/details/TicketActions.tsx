
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Gift } from "lucide-react";
import DownloadTicketImage from "@/components/tickets/DownloadTicketImage";

interface TicketActionsProps {
  ticket: any;
  seller: any;
  currentUser: any;
  onPurchase?: () => void;
  purchaseLoading?: boolean;
  alreadyPurchased?: boolean;
  isSeller?: boolean;
  isPastKickoff?: boolean;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  ticket,
  seller,
  currentUser,
  onPurchase,
  purchaseLoading = false,
  alreadyPurchased = false,
  isSeller = false,
  isPastKickoff = false
}) => {
  const showPurchaseButton = !alreadyPurchased && !isSeller && !isPastKickoff && currentUser;

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {showPurchaseButton && onPurchase && (
        <Button
          onClick={onPurchase}
          disabled={purchaseLoading}
          className="bg-betting-green hover:bg-betting-green/90 text-white"
          size="sm"
        >
          {purchaseLoading ? (
            "Processing..."
          ) : (
            <>
              {ticket.is_free ? <Gift className="h-4 w-4 mr-1" /> : <ShoppingCart className="h-4 w-4 mr-1" />}
              {ticket.is_free ? "Get Free Ticket" : `Purchase for R${ticket.price}`}
            </>
          )}
        </Button>
      )}
      
      <DownloadTicketImage 
        ticket={ticket}
        seller={seller}
      />
    </div>
  );
};

export default TicketActions;
