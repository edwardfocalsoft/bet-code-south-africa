
import React from "react";
import ShareTicket from "@/components/tickets/ShareTicket";

interface TicketActionsProps {
  ticket: any;
  seller: any;
  currentUser: any;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  ticket,
  seller,
  currentUser
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <ShareTicket 
        ticketId={ticket.id} 
        ticketTitle={ticket.title} 
        ticket={ticket}
        seller={seller}
      />
    </div>
  );
};

export default TicketActions;
