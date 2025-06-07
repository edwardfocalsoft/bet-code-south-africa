
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isValid } from "date-fns";
import { formatCurrency } from "@/utils/formatting";
import { Badge } from "@/components/ui/badge";
import { BettingSite } from "@/types";

interface TicketPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: {
    title: string;
    description: string;
    bettingSite: BettingSite;
    price: number;
    isFree: boolean;
    odds: string;
    date: Date;
    time: string;
    ticketCode: string;
  };
}

const TicketPreview: React.FC<TicketPreviewProps> = ({ isOpen, onClose, ticketData }) => {
  // Generate the masked ticket code (first 3 characters visible, rest masked)
  const maskedTicketCode = ticketData.ticketCode 
    ? `${ticketData.ticketCode.substring(0, 3)}${'•'.repeat(Math.max(0, ticketData.ticketCode.length - 3))}`
    : "";
    
  // Safely format the kickoff date/time with validation
  const getFormattedKickoffTime = () => {
    try {
      // Ensure we have a valid date and time
      if (!ticketData.date || !ticketData.time) {
        return "Date/Time not set";
      }

      const kickoffDate = new Date(ticketData.date);
      
      // Check if the base date is valid
      if (!isValid(kickoffDate)) {
        return "Invalid date";
      }

      // Parse and validate time
      const timeParts = ticketData.time.split(':');
      if (timeParts.length !== 2) {
        return "Invalid time format";
      }

      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      // Validate time values
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return "Invalid time values";
      }

      kickoffDate.setHours(hours, minutes);

      // Final validation check
      if (!isValid(kickoffDate)) {
        return "Invalid kickoff time";
      }

      return format(kickoffDate, "PPP 'at' p");
    } catch (error) {
      console.error("Error formatting kickoff time:", error);
      return "Error formatting date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-betting-black text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Ticket Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{ticketData.title}</h3>
            <p className="text-sm text-gray-400">{ticketData.description}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Betting Site:</span>
            <Badge variant="outline" className="text-betting-green border-betting-green">
              {ticketData.bettingSite}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Price:</span>
            <span className="font-bold">
              {ticketData.isFree 
                ? "Free" 
                : formatCurrency(ticketData.price)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Odds:</span>
            <span className="font-bold">{ticketData.odds}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Ticket Code:</span>
            <span className="font-mono bg-betting-dark-gray px-2 py-1 rounded">
              {maskedTicketCode}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Kick-off:</span>
            <span>{getFormattedKickoffTime()}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-betting-dark-gray">
            <p className="text-xs text-muted-foreground">
              This is a preview of how your ticket will appear. Ticket code will be partially 
              masked to non-buyers.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPreview;
