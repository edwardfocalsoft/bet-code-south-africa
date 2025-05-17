
import React from "react";
import { Link } from "react-router-dom";
import { BettingTicket } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TicketTableRowProps {
  ticket: BettingTicket;
}

const TicketTableRow: React.FC<TicketTableRowProps> = ({ ticket }) => {
  return (
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
  );
};

export default TicketTableRow;
