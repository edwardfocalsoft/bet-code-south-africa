
import { useCallback } from "react";
import { BettingTicket } from "@/types";
import { isPast } from "date-fns";

export const useTicketMapper = () => {
  // Map database tickets to frontend ticket objects
  const mapDatabaseTickets = useCallback((data: any[]): BettingTicket[] => {
    return data.map((ticket: any) => {
      const kickoffTime = new Date(ticket.kickoff_time);
      // Extra safeguard: Check if the ticket is expired based on kickoff time
      const isExpiredByDate = isPast(kickoffTime);
      
      return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        sellerId: ticket.seller_id,
        sellerUsername: ticket.profiles?.username || "Unknown Seller",
        price: parseFloat(String(ticket.price)),
        isFree: ticket.is_free,
        bettingSite: ticket.betting_site,
        kickoffTime: kickoffTime,
        createdAt: new Date(ticket.created_at),
        odds: ticket.odds ? parseFloat(String(ticket.odds)) : undefined,
        legs: ticket.legs || undefined,
        isHidden: ticket.is_hidden,
        // Critical fix: Mark as expired either if explicitly marked in DB or if kickoff time has passed
        isExpired: ticket.is_expired || isExpiredByDate,
        eventResults: ticket.event_results,
      };
    });
  }, []);

  return { mapDatabaseTickets };
};
