
import React from "react";
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
              {tickets.map((ticket) => (
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
                      ticket={ticket} 
                      onToggleVisibility={onToggleVisibility}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketsTable;
