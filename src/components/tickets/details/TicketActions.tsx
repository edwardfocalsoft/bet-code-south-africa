
import React from "react";
import DownloadTicketImage from "@/components/tickets/DownloadTicketImage";

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
      <DownloadTicketImage 
        ticket={ticket}
        seller={seller}
      />
    </div>
  );
};

export default TicketActions;
