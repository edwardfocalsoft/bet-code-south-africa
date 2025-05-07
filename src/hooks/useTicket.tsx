
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket } from "@/types";

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
          price: parseFloat(String(data.price)),
          isFree: data.is_free,
          bettingSite: data.betting_site,
          kickoffTime: new Date(data.kickoff_time),
          createdAt: new Date(data.created_at),
          odds: data.odds ? parseFloat(String(data.odds)) : undefined,
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
