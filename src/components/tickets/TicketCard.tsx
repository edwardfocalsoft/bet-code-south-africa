
import React from "react";
import { Link } from "react-router-dom";
import { BettingTicket } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Star, Clock, Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: BettingTicket;
  purchased?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, purchased = false }) => {
  const isExpired = new Date(ticket.kickoffTime) < new Date();
  const isPaid = !ticket.isFree;
  
  const timeUntilKickoff = formatDistanceToNow(new Date(ticket.kickoffTime), {
    addSuffix: true,
  });
  
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div
      className={cn(
        "betting-card group",
        isExpired && !purchased && "opacity-75"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span
            className={cn(
              "betting-badge inline-block mb-2",
              ticket.isFree ? "betting-badge-free" : "betting-badge-paid"
            )}
          >
            {ticket.isFree ? "FREE" : `R${ticket.price}`}
          </span>
          <span className="ml-2 text-xs text-muted-foreground bg-betting-light-gray px-2 py-1 rounded-full">
            {ticket.bettingSite}
          </span>
        </div>
        
        {ticket.odds && (
          <div className="bg-betting-accent/10 text-betting-accent font-medium px-2 py-1 rounded text-sm">
            {ticket.odds.toFixed(2)}x
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium mb-1">
        {ticket.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-3">
        {purchased || ticket.isFree
          ? truncateDescription(ticket.description)
          : "Purchase this ticket to view the detailed analysis and betting code."}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {isExpired
              ? "Expired"
              : `Starts ${timeUntilKickoff}`}
          </span>
        </div>
        
        <div className="flex items-center">
          <Link
            to={`/seller/${ticket.sellerId}`}
            className="hover:text-betting-green transition-colors"
          >
            @{ticket.sellerUsername}
          </Link>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Link
          to={`/tickets/${ticket.id}`}
          className="betting-button-primary text-sm"
        >
          {purchased ? "View Details" : isPaid && !purchased ? "Buy Now" : "View Details"}
        </Link>
        
        {isPaid && !purchased && (
          <div className="flex items-center text-muted-foreground">
            <Lock className="h-4 w-4 mr-1" />
            <span className="text-xs">Locked</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
