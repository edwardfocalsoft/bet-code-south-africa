
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { BettingTicket } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";

interface FeaturedTicketsTableProps {
  tickets: BettingTicket[];
  loading: boolean;
}

const FeaturedTicketsTable: React.FC<FeaturedTicketsTableProps> = ({
  tickets,
  loading,
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured tickets available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-betting-dark-gray rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-betting-light-gray">
              <TableHead className="text-white">Title</TableHead>
              <TableHead className="text-white">Seller</TableHead>
              <TableHead className="text-white">Site</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Kickoff</TableHead>
              <TableHead className="text-white">Odds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-betting-light-gray hover:bg-betting-light-gray/50">
                <TableCell>
                  <Link 
                    to={`/tickets/${ticket.id}`}
                    className="text-betting-green hover:underline font-medium"
                  >
                    {ticket.title}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-300">
                  <Link 
                    to={`/sellers/${ticket.sellerId}`}
                    className="text-gray-300 hover:text-betting-green"
                  >
                    {ticket.sellerUsername}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-betting-green text-betting-green">
                    {ticket.bettingSite}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">
                  {ticket.isFree ? (
                    <Badge className="bg-betting-green text-white">FREE</Badge>
                  ) : (
                    formatCurrency(ticket.price)
                  )}
                </TableCell>
                <TableCell className="text-gray-300">
                  {format(ticket.kickoffTime, "MMM dd, HH:mm")}
                </TableCell>
                <TableCell className="text-gray-300">
                  {ticket.odds ? `${ticket.odds}` : "N/A"}
                </TableCell>
              </TableRow>
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

export default FeaturedTicketsTable;
