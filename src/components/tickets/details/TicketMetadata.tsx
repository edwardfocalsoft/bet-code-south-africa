
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, CircleDollarSign, Star } from "lucide-react";

interface TicketMetadataProps {
  kickoffTime: string;
  price: number;
  isFree: boolean;
  odds?: number;
}

const TicketMetadata: React.FC<TicketMetadataProps> = ({
  kickoffTime,
  price,
  isFree,
  odds
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4 text-betting-green" />
        <span>{format(new Date(kickoffTime), 'PPP')}</span>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4 text-betting-green" />
        <span>{format(new Date(kickoffTime), 'p')}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-4 w-4 text-betting-green" />
        <span className="font-medium">
          {isFree 
            ? "Free" 
            : `R${price ? Number(price).toFixed(2) : "0.00"}`}
        </span>
      </div>
      
      {odds && (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-betting-green" />
          <span className="font-medium">
            Odds: {odds}
          </span>
        </div>
      )}
    </div>
  );
};

export default TicketMetadata;
