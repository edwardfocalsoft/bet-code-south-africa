
import React from "react";
import { BettingTicket } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TicketTableRow from "./TicketTableRow";
import TicketTableEmpty from "./TicketTableEmpty";

interface TicketsTableProps {
  tickets: BettingTicket[];
  emptyMessage?: string;
  hideSeller?: boolean;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ 
  tickets, 
  emptyMessage = "No tickets available.",
  hideSeller = false
}) => {
  if (!tickets || tickets.length === 0) {
    return <TicketTableEmpty message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="betting-card">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            {!hideSeller && <TableHead>Seller</TableHead>}
            <TableHead>Betting Site</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Kickoff</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TicketTableRow 
              key={ticket.id} 
              ticket={ticket} 
              hideSeller={hideSeller}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketsTable;
