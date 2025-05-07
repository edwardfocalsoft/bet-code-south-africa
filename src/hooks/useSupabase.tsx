
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket, User, Purchase, Rating } from "@/types";

interface UseSupabaseOptions {
  fetchOnMount?: boolean;
}

export function useTickets(options: UseSupabaseOptions = { fetchOnMount: true }) {
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
        query = query.lte("price", filters.maxPrice.toString());
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
        query = query.order(filters.sortBy, { ascending: filters.sortOrder !== "desc" });
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
        price: parseFloat(ticket.price),
        isFree: ticket.is_free,
        bettingSite: ticket.betting_site,
        kickoffTime: new Date(ticket.kickoff_time),
        createdAt: new Date(ticket.created_at),
        odds: ticket.odds ? parseFloat(ticket.odds) : undefined,
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

export function useSellers(options: UseSupabaseOptions = { fetchOnMount: true }) {
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "seller")
        .eq("approved", true)
        .eq("suspended", false);

      if (error) throw error;

      const mappedSellers = data.map((seller: any) => ({
        id: seller.id,
        email: seller.email,
        role: seller.role,
        username: seller.username || "Anonymous",
        createdAt: new Date(seller.created_at),
        approved: seller.approved,
        suspended: seller.suspended,
        loyaltyPoints: seller.loyalty_points || 0,
      }));

      setSellers(mappedSellers);
    } catch (error: any) {
      console.error("Error fetching sellers:", error);
      setError(error.message || "Failed to fetch sellers");
      toast({
        title: "Error",
        description: "Failed to load sellers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (options.fetchOnMount) {
      fetchSellers();
    }
  }, [options.fetchOnMount, fetchSellers]);

  return { sellers, loading, error, fetchSellers };
}

export function useTicket(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<BettingTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("tickets")
          .select(`
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
          `)
          .eq("id", ticketId)
          .single();

        if (error) throw error;

        const mappedTicket = {
          id: data.id,
          title: data.title,
          description: data.description,
          sellerId: data.seller_id,
          sellerUsername: data.profiles?.username || "Unknown Seller",
          price: parseFloat(data.price),
          isFree: data.is_free,
          bettingSite: data.betting_site,
          kickoffTime: new Date(data.kickoff_time),
          createdAt: new Date(data.created_at),
          odds: data.odds ? parseFloat(data.odds) : undefined,
          isHidden: data.is_hidden,
          isExpired: data.is_expired,
          eventResults: data.event_results,
        };

        setTicket(mappedTicket);
      } catch (error: any) {
        console.error("Error fetching ticket:", error);
        setError(error.message || "Failed to fetch ticket");
        toast({
          title: "Error",
          description: "Failed to load ticket details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, toast]);

  return { ticket, loading, error };
}

export default function useSupabase() {
  return { supabase, useTickets, useSellers, useTicket };
}
