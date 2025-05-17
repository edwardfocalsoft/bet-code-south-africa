
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { BettingTicket } from "@/types";

interface TicketsTableProps {
  tickets: Array<BettingTicket & { sellerEmail: string }>;
  loading: boolean;
  onToggleVisibility: (ticketId: string, isHidden: boolean) => void;
  onMarkExpired: (ticketId: string, isExpired: boolean) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ 
  tickets, 
  loading, 
  onToggleVisibility, 
  onMarkExpired 
}) => {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Betting Site</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Kickoff Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Betting Site</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Kickoff Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No tickets found in this category.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Betting Site</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Kickoff Time</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <Link to={`/tickets/${ticket.id}`} className="hover:text-betting-green font-medium">
                {ticket.title}
              </Link>
              {ticket.isFree && (
                <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-500">
                  Free
                </Badge>
              )}
              {ticket.isHidden && (
                <Badge variant="outline" className="ml-2 bg-red-900/30 text-red-400 border-red-500">
                  Hidden
                </Badge>
              )}
              {ticket.isExpired && (
                <Badge variant="outline" className="ml-2 bg-gray-900/30 text-gray-400 border-gray-500">
                  Expired
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Link to={`/sellers/${ticket.sellerId}`} className="hover:text-betting-green">
                {ticket.sellerUsername}
              </Link>
            </TableCell>
            <TableCell>{ticket.bettingSite}</TableCell>
            <TableCell>
              {ticket.isFree ? (
                <span className="text-green-400">Free</span>
              ) : (
                <span>R {ticket.price.toFixed(2)}</span>
              )}
            </TableCell>
            <TableCell>{ticket.kickoffTime.toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleVisibility(ticket.id, !ticket.isHidden)}
                >
                  {ticket.isHidden ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" /> Show
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" /> Hide
                    </>
                  )}
                </Button>
                
                {!ticket.isExpired && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500 text-amber-500"
                    onClick={() => onMarkExpired(ticket.id, true)}
                  >
                    Mark Expired
                  </Button>
                )}
                
                {ticket.isExpired && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-500"
                    onClick={() => onMarkExpired(ticket.id, false)}
                  >
                    Restore
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TicketsTable;
