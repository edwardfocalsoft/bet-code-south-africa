
import React from "react";
import { BettingTicket } from "@/types";
import TicketCard from "./TicketCard";

interface TicketsListProps {
  tickets: BettingTicket[];
  title?: string;
  emptyMessage?: string;
  purchased?: boolean;
}

const TicketsList: React.FC<TicketsListProps> = ({
  tickets,
  title,
  emptyMessage = "No tickets available",
  purchased = false,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-medium mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} purchased={purchased} />
        ))}
      </div>
    </div>
  );
};

export default TicketsList;
