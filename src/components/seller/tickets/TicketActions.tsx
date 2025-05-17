
import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { BettingTicket } from "@/types";

interface TicketActionsProps {
  ticket: BettingTicket;
  onToggleVisibility: (ticketId: string, currentHidden: boolean) => void;
  onDelete: (ticketId: string) => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({ 
  ticket, 
  onToggleVisibility, 
  onDelete 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link to={`/tickets/${ticket.id}`}>
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            <span>View</span>
          </DropdownMenuItem>
        </Link>
        
        {!ticket.isExpired && (
          <>
            <Link to={`/seller/tickets/edit/${ticket.id}`}>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => onToggleVisibility(ticket.id, Boolean(ticket.isHidden))}>
              <Eye className="mr-2 h-4 w-4" />
              <span>{ticket.isHidden ? "Show" : "Hide"}</span>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem onClick={() => onDelete(ticket.id)} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TicketActions;
