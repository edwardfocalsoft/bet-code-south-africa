
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import ShareTicket from "@/components/tickets/ShareTicket";
import { format, isValid } from "date-fns";

interface TicketHeaderProps {
  ticket: any;
  isPastKickoff: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ 
  ticket, 
  isPastKickoff, 
  isSeller,
  isAdmin
}) => {
  // Make sure the date is valid before trying to format it
  const kickoffTime = ticket.kickoff_time ? new Date(ticket.kickoff_time) : new Date();
  const isValidKickoffTime = isValid(kickoffTime);

  // Helper function to safely format dates
  const safeFormat = (date: string | Date | null | undefined, formatStr: string, fallback: string = 'N/A') => {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return fallback;
    
    try {
      return format(dateObj, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return fallback;
    }
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          {ticket.is_free && (
            <Badge className="bg-green-900/30 text-green-400 border-green-500">
              Free
            </Badge>
          )}
          
          {isPastKickoff && (
            <Badge variant="destructive">
              Expired
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          {isValidKickoffTime && (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{safeFormat(kickoffTime, "PPP")}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{safeFormat(kickoffTime, "p")}</span>
              </div>
            </>
          )}
          
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <Link 
              to={`/sellers/${ticket.seller_id}`} 
              className="text-betting-green hover:underline"
            >
              {ticket.profiles?.username || "Unknown Seller"}
            </Link>
          </div>
        </div>
      </div>
      
      {(isSeller || isAdmin) && (
        <ShareTicket ticketId={ticket.id} ticketTitle={ticket.title} />
      )}
    </div>
  );
};

export default TicketHeader;
