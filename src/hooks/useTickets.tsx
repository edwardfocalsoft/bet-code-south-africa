import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket, BettingSite } from "@/types";
import { useAuth } from "@/contexts/auth";
import { useTicketFilters } from "./tickets/useTicketFilters";
import { useTicketMapper } from "./tickets/useTicketMapper";
import { useTicketActions } from "./tickets/useTicketActions";

interface FilterOptions {
  bettingSite?: BettingSite | "all";
  isFree?: boolean;
  maxPrice?: number;
  showExpired?: boolean;
  sellerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showHidden?: boolean;
  randomize?: boolean; // Add randomize option
}

interface UseTicketsOptions {
  fetchOnMount?: boolean;
  filterExpired?: boolean;
  role?: "buyer" | "seller" | "admin";
  randomize?: boolean; // Add randomize option
}

export function useTickets(options: UseTicketsOptions = { fetchOnMount: true, filterExpired: true, role: "buyer", randomize: false }) {
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const ticketFilters = useTicketFilters();
  const ticketMapper = useTicketMapper();
  const ticketActions = useTicketActions();

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

      // Apply all filters using the extracted functions
      query = ticketFilters.applyBettingSiteFilter(query, mergedFilters.bettingSite);
      query = ticketFilters.applyFreeTicketFilter(query, mergedFilters.isFree);
      query = ticketFilters.applyMaxPriceFilter(query, mergedFilters.maxPrice);
      query = ticketFilters.applyExpiredFilter(query, mergedFilters, options.role || "buyer");
      query = ticketFilters.applySellerFilter(query, mergedFilters.sellerId);
      query = ticketFilters.applyHiddenFilter(query, mergedFilters.showHidden);
      
      // Apply random ordering if specified
      if (options.randomize || mergedFilters.randomize) {
        // For random tickets, we first filter by current time to ensure only future events
        const now = new Date().toISOString();
        query = query.gt('kickoff_time', now);
        
        // Then apply random ordering (we're using created_at with limit as a simple way to get different results)
        query = ticketFilters.applyRandomOrder(query, true);
      } else {
        // Otherwise use normal sorting
        query = ticketFilters.applySorting(query, mergedFilters.sortBy, mergedFilters.sortOrder);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedTickets = ticketMapper.mapDatabaseTickets(data || []);
      
      // Extra filter to ensure no expired tickets are shown to buyers
      // Now also filter by kickoff time to ensure only upcoming events
      const finalTickets = options.role === "buyer" 
        ? mappedTickets.filter(ticket => !ticket.isExpired && new Date(ticket.kickoffTime) > new Date()) 
        : mappedTickets;
      
      setTickets(finalTickets);
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
  }, [
    filters,
    ticketFilters,
    ticketMapper,
    options.role,
    options.randomize,
    toast
  ]);

  useEffect(() => {
    if (options.fetchOnMount) {
      // Pass additional seller ID filter if in seller mode
      if (options.role === "seller" && currentUser) {
        fetchTickets({ sellerId: currentUser.id });
      } else {
        fetchTickets({ randomize: options.randomize });
      }
    }
    // Important: Don't include fetchTickets in the dependency array to prevent infinite loops
  }, [options.fetchOnMount, options.role, currentUser, options.randomize]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      // Don't call fetchTickets here to prevent infinite loop
      return updatedFilters;
    });
    
    // Call fetchTickets separately with the new filters
    fetchTickets(newFilters);
  }, [fetchTickets]);

  return { 
    tickets, 
    loading, 
    error, 
    fetchTickets,
    filters,
    updateFilters,
    ...ticketActions // Include ticket actions from the new hook
  };
}
