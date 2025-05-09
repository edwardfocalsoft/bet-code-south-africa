
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket } from "@/types";

interface UseTicketsOptions {
  fetchOnMount?: boolean;
}

export function useTickets(options: UseTicketsOptions = { fetchOnMount: true }) {
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTickets = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("tickets").select(`
        id,
        title,
        description,
        price,
        is_free,
        betting_site,
        kickoff_time,
        created_at,
        odds,
        is_hidden,
        is_expired,
        event_results,
        seller_id,
        profiles:seller_id (username)
      `);

      if (filters?.bettingSite) {
        query = query.eq("betting_site", filters.bettingSite);
      }

      if (filters?.isFree !== undefined) {
        query = query.eq("is_free", filters.isFree);
      }

      if (filters?.maxPrice !== undefined) {
        // Convert the number to string since that's what Supabase expects
        const maxPriceStr = String(filters.maxPrice);
        query = query.lte("price", maxPriceStr);
      }

      // By default, don't show expired tickets unless specifically asked for
      if (filters?.showExpired !== true) {
        query = query.eq("is_expired", false);
      }

      // By default, don't show hidden tickets
      if (filters?.showHidden !== true) {
        query = query.eq("is_hidden", false);
      }

      // Sort options
      if (filters?.sortBy) {
        // Convert sortBy to string if it's a number
        const sortByValue = typeof filters.sortBy === 'number' ? String(filters.sortBy) : filters.sortBy;
        query = query.order(sortByValue, { 
          ascending: filters.sortOrder !== "desc" 
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedTickets = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        sellerId: ticket.seller_id,
        sellerUsername: ticket.profiles?.username || "Unknown Seller",
        price: parseFloat(String(ticket.price)),
        isFree: ticket.is_free,
        bettingSite: ticket.betting_site,
        kickoffTime: new Date(ticket.kickoff_time),
        createdAt: new Date(ticket.created_at),
        odds: ticket.odds ? parseFloat(String(ticket.odds)) : undefined,
        isHidden: ticket.is_hidden,
        isExpired: ticket.is_expired,
        eventResults: ticket.event_results,
      }));

      setTickets(mappedTickets);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      setError(error.message || "Failed to fetch tickets");
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (options.fetchOnMount) {
      fetchTickets();
    }
  }, [options.fetchOnMount, fetchTickets]);

  return { tickets, loading, error, fetchTickets };
}
