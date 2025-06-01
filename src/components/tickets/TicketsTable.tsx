
import React, { useState } from "react";
import { BettingTicket } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5; // Changed to 5 items per page
  
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!tickets || tickets.length === 0) {
    return <TicketTableEmpty message={emptyMessage} />;
  }

  return (
    <div className="space-y-4">
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
            {currentTickets.map((ticket) => (
              <TicketTableRow 
                key={ticket.id} 
                ticket={ticket} 
                hideSeller={hideSeller}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TicketsTable;
