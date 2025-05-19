
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TicketActionsProps {
  ticketId: string;
  isHidden: boolean;
  isExpired: boolean;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  ticketId,
  isHidden,
  isExpired,
  onToggleVisibility,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onToggleVisibility}>
          {isHidden ? (
            <>
              <Eye className="mr-2 h-4 w-4" />
              <span>Publish Ticket</span>
            </>
          ) : (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              <span>Hide Ticket</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to={`/seller/tickets/edit/${ticketId}`} className="flex items-center">
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Ticket</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Ticket</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TicketActions;
