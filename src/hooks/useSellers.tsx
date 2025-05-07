
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface UseSellersOptions {
  fetchOnMount?: boolean;
}

export function useSellers(options: UseSellersOptions = { fetchOnMount: true }) {
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
