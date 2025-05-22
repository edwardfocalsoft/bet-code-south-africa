
import React from "react";
import { Badge } from "@/components/ui/badge";
import ShareTicket from "../ShareTicket";

interface TicketHeaderProps {
  title: string;
  bettingSite: string;
  isPastKickoff: boolean;
  isFree: boolean;
  isSeller: boolean;
  ticketId: string; // Added ticketId prop
}

const TicketHeader: React.FC<TicketHeaderProps> = ({
  title,
  bettingSite,
  isPastKickoff,
  isFree,
  isSeller,
  ticketId // Include ticketId in destructuring
}) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        {!isSeller && (
          <ShareTicket 
            ticketId={ticketId}  // Pass the actual ticketId here
            ticketTitle={title}
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
