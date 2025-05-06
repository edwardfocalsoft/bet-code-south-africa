
import React from "react";
import { Link } from "react-router-dom";
import { BettingTicket } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TicketsTableProps {
  tickets: BettingTicket[];
  emptyMessage?: string;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ 
  tickets, 
  emptyMessage = "No tickets available." 
}) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-betting-green opacity-50" />
        <p className="mt-4 text-betting-green text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="betting-card">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Betting Site</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Kickoff</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="hover:bg-betting-dark-gray/50">
              <TableCell className="font-medium">
                <Link to={`/tickets/${ticket.id}`} className="hover:text-betting-green">
                  {ticket.title}
                </Link>
                
                {ticket.isFree && (
                  <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-500">
                    Free
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Link to={`/sellers/${ticket.sellerId}`} className="hover:text-betting-green">
                  {ticket.sellerUsername}
                </Link>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  {ticket.bettingSite}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {ticket.isFree ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  <span>R {ticket.price}</span>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-betting-green" />
                  {formatDistanceToNow(new Date(ticket.kickoffTime), { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link to={`/tickets/${ticket.id}`}>
                  <Button variant="outline" size="sm" className="text-betting-green border-betting-green hover:bg-betting-green/10">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketsTable;
