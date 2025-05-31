
import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BettingTicket } from "@/types";
import TicketActions from "./TicketActions";

interface TicketsTableProps {
  tickets: BettingTicket[];
  onToggleVisibility: (ticketId: string, currentHidden: boolean) => void;
  onDelete: (ticketId: string) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ 
  tickets, 
  onToggleVisibility,
  onDelete
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5; // Set to 5 items per page
  
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderTicketStatusBadge = (ticket: BettingTicket) => {
    if (ticket.isExpired) {
      return <Badge className="bg-gray-500">Expired</Badge>;
    } else if (ticket.isHidden) {
      return <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>;
    } else {
      return <Badge className="bg-betting-green">Active</Badge>;
    }
  };

  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Betting Tickets</CardTitle>
        <CardDescription>
          Manage your betting tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Kickoff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.title}</TableCell>
                    <TableCell>
                      {ticket.isFree ? (
                        <span className="text-betting-green">Free</span>
                      ) : (
                        `R${ticket.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>{ticket.odds?.toFixed(2)}</TableCell>
                    <TableCell>{format(ticket.kickoffTime, "dd MMM yyyy HH:mm")}</TableCell>
                    <TableCell>{renderTicketStatusBadge(ticket)}</TableCell>
                    <TableCell className="text-right">
                      <TicketActions 
                        ticketId={ticket.id}
                        isHidden={!!ticket.isHidden}
                        isExpired={!!ticket.isExpired}
                        onToggleVisibility={onToggleVisibility}
                        onDelete={onDelete}
                      />
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
      </CardContent>
    </Card>
  );
};

export default TicketsTable;
