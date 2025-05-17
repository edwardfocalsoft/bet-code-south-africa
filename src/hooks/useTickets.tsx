
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket } from "@/types";
import { useAuth } from "@/contexts/auth";

interface FilterOptions {
  bettingSite?: string;
  isFree?: boolean;
  maxPrice?: number;
  showExpired?: boolean;
  sellerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showHidden?: boolean;
}

interface UseTicketsOptions {
  fetchOnMount?: boolean;
  filterExpired?: boolean;
  role?: "buyer" | "seller";
}

export function useTickets(options: UseTicketsOptions = { fetchOnMount: true, filterExpired: true, role: "buyer" }) {
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Add filter states
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchTickets = useCallback(async (filterOptions?: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      // Merge the passed filters with the state filters
      const mergedFilters = { ...filters, ...filterOptions };

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

      if (mergedFilters?.bettingSite) {
        query = query.eq("betting_site", mergedFilters.bettingSite);
      }

      if (mergedFilters?.isFree !== undefined) {
        query = query.eq("is_free", mergedFilters.isFree);
      }

      if (mergedFilters?.maxPrice !== undefined) {
        // Convert the number to string since that's what Supabase expects
        const maxPriceStr = String(mergedFilters.maxPrice);
        query = query.lte("price", maxPriceStr);
      }

      // Filter expired tickets based on role
      if (options.role === "buyer" && options.filterExpired !== false) {
        // For buyers, ALWAYS hide expired tickets unless explicitly requested
        query = query.eq("is_expired", false);
      } else if (mergedFilters?.showExpired !== undefined) {
        query = query.eq("is_expired", mergedFilters.showExpired);
      }

      // For sellers, we want to show their expired tickets when requested
      if (options.role === "seller" && mergedFilters?.sellerId) {
        query = query.eq("seller_id", mergedFilters.sellerId);
      }

      // By default, don't show hidden tickets
      if (mergedFilters?.showHidden !== true) {
        query = query.eq("is_hidden", false);
      }

      // Sort options
      if (mergedFilters?.sortBy) {
        // Convert sortBy to string if it's a number
        const sortByValue = typeof mergedFilters.sortBy === 'number' ? String(mergedFilters.sortBy) : mergedFilters.sortBy;
        query = query.order(sortByValue, { 
          ascending: mergedFilters.sortOrder !== "desc" 
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
  }, [toast, options.role, options.filterExpired, filters]);

  useEffect(() => {
    if (options.fetchOnMount) {
      // Pass additional seller ID filter if in seller mode
      if (options.role === "seller" && currentUser) {
        fetchTickets({ sellerId: currentUser.id });
      } else {
        fetchTickets();
      }
    }
  }, [options.fetchOnMount, fetchTickets, options.role, currentUser]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      fetchTickets(updatedFilters);
      return updatedFilters;
    });
  }, [fetchTickets]);

  return { 
    tickets, 
    loading, 
    error, 
    fetchTickets,
    filters,
    updateFilters
  };
}
