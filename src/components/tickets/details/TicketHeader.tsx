
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import ShareTicket from "../ShareTicket";

interface TicketHeaderProps {
  title: string;
  bettingSite: string;
  isPastKickoff: boolean;
  isFree: boolean;
  isSeller: boolean;
  ticketId: string;
  ticket: any;
  seller: any;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({
  title,
  bettingSite,
  isPastKickoff,
  isFree,
  isSeller,
  ticketId,
  ticket,
  seller
}) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          {seller && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">by</span>
              <span className="text-sm font-medium">{seller.username || "Anonymous"}</span>
              {seller.verified && (
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
          )}
        </div>
        {!isSeller && (
          <ShareTicket 
            ticketId={ticketId}
            ticketTitle={title}
            ticket={ticket}
            seller={seller}
          />
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge className="bg-betting-green hover:bg-betting-green">
          {bettingSite}
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
        
        {isFree && (
          <Badge className="bg-purple-600 hover:bg-purple-700">
            Free
          </Badge>
        )}
      </div>
    </>
  );
};

export default TicketHeader;
