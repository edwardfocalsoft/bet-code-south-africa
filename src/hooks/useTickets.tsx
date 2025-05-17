
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket, BettingSite } from "@/types";
import { useAuth } from "@/contexts/auth";

interface FilterOptions {
  bettingSite?: BettingSite | "all";
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
  role?: "buyer" | "seller" | "admin";
}

export function useTickets(options: UseTicketsOptions = { fetchOnMount: true, filterExpired: true, role: "buyer" }) {
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Add filter states
  const [filters, setFilters] = useState<FilterOptions>({});

  // Apply betting site filter to the query
  const applyBettingSiteFilter = useCallback((query: any, filter: BettingSite | "all" | undefined) => {
    if (filter && filter !== "all") {
      return query.eq("betting_site", filter);
    }
    return query;
  }, []);

  // Apply free ticket filter to the query
  const applyFreeTicketFilter = useCallback((query: any, isFree: boolean | undefined) => {
    if (isFree !== undefined) {
      return query.eq("is_free", isFree);
    }
    return query;
  }, []);

  // Apply maximum price filter to the query
  const applyMaxPriceFilter = useCallback((query: any, maxPrice: number | undefined) => {
    if (maxPrice !== undefined) {
      const maxPriceStr = String(maxPrice);
      return query.lte("price", maxPriceStr);
    }
    return query;
  }, []);

  // Apply expired tickets filter based on role
  const applyExpiredFilter = useCallback((query: any, mergedFilters: FilterOptions, role: string) => {
    if (role === "buyer") {
      // Buyers should NEVER see expired tickets
      return query.eq("is_expired", false);
    } else if (role === "seller" || role === "admin") {
      // For sellers and admins, respect the showExpired filter if provided
      if (mergedFilters?.showExpired !== undefined) {
        return query.eq("is_expired", mergedFilters.showExpired);
      }
    }
    return query;
  }, []);

  // Apply seller ID filter (for sellers viewing their own tickets)
  const applySellerFilter = useCallback((query: any, sellerId: string | undefined) => {
    if (sellerId) {
      return query.eq("seller_id", sellerId);
    }
    return query;
  }, []);

  // Apply hidden tickets filter
  const applyHiddenFilter = useCallback((query: any, showHidden: boolean | undefined) => {
    if (showHidden !== true) {
      return query.eq("is_hidden", false);
    }
    return query;
  }, []);

  // Apply sorting to the query
  const applySorting = useCallback((query: any, sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => {
    if (sortBy) {
      const sortByValue = typeof sortBy === 'number' ? String(sortBy) : sortBy;
      return query.order(sortByValue, { 
        ascending: sortOrder !== "desc" 
      });
    }
    return query.order("created_at", { ascending: false });
  }, []);

  // Map database tickets to frontend ticket objects
  const mapDatabaseTickets = useCallback((data: any[]): BettingTicket[] => {
    return data.map((ticket: any) => ({
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
  }, []);

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
      query = applyBettingSiteFilter(query, mergedFilters.bettingSite);
      query = applyFreeTicketFilter(query, mergedFilters.isFree);
      query = applyMaxPriceFilter(query, mergedFilters.maxPrice);
      query = applyExpiredFilter(query, mergedFilters, options.role || "buyer");
      query = applySellerFilter(query, mergedFilters.sellerId);
      query = applyHiddenFilter(query, mergedFilters.showHidden);
      query = applySorting(query, mergedFilters.sortBy, mergedFilters.sortOrder);

      const { data, error } = await query;

      if (error) throw error;

      const mappedTickets = mapDatabaseTickets(data);
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
  }, [
    toast,
    options.role,
    filters,
    applyBettingSiteFilter,
    applyFreeTicketFilter,
    applyMaxPriceFilter,
    applyExpiredFilter,
    applySellerFilter,
    applyHiddenFilter,
    applySorting,
    mapDatabaseTickets
  ]);

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
