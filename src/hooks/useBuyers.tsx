
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface UseBuyersOptions {
  fetchOnMount?: boolean;
  page?: number;
  pageSize?: number;
}

export function useBuyers(options: UseBuyersOptions = { fetchOnMount: true, page: 1, pageSize: 10 }) {
  const [buyers, setBuyers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total count first for pagination
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "buyer");

      if (countError) throw countError;
      
      if (count !== null) {
        setTotalCount(count);
      }

      // Fetch buyers with pagination
      const from = (options.page || 1) * (options.pageSize || 10) - (options.pageSize || 10);
      const to = from + (options.pageSize || 10) - 1;

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "buyer")
        .range(from, to);

      if (fetchError) throw fetchError;

      if (data) {
        // Get purchases count in a separate query to avoid join issues
        const buyerIds = data.map((buyer: any) => buyer.id);
        
        // Get purchase counts for each buyer
        const { data: purchasesData, error: purchasesError } = await supabase
          .from("purchases")
          .select("buyer_id, count")
          .in("buyer_id", buyerIds)
          .group("buyer_id");
          
        const purchaseCounts = purchasesData?.reduce((acc: Record<string, number>, curr: any) => {
          acc[curr.buyer_id] = parseInt(curr.count);
          return acc;
        }, {}) || {};

        const mappedBuyers = data.map((buyer: any) => ({
          id: buyer.id,
          email: buyer.email,
          role: buyer.role,
          username: buyer.username || "Anonymous",
          createdAt: new Date(buyer.created_at),
          approved: buyer.approved,
          suspended: buyer.suspended,
          lastActive: new Date(buyer.updated_at),
          purchasesCount: purchaseCounts[buyer.id] || 0,
          loyaltyPoints: buyer.loyalty_points || 0,
        }));

        setBuyers(mappedBuyers);
      }
    } catch (error: any) {
      console.error("Error fetching buyers:", error);
      setError(error.message || "Failed to fetch buyers");
      toast({
        title: "Error",
        description: "Failed to load buyers. Please try again later.",
        variant: "destructive",
      });
      // Set empty array to prevent infinite loading state
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, [options.page, options.pageSize, toast]);

  const updateBuyerStatus = useCallback(async (
    buyerId: string,
    updates: { approved?: boolean; suspended?: boolean }
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", buyerId);

      if (error) throw error;

      // Update local state
      setBuyers(buyers.map(buyer => {
        if (buyer.id === buyerId) {
          return { 
            ...buyer, 
            ...updates 
          };
        }
        return buyer;
      }));

      return true;
    } catch (error: any) {
      console.error("Error updating buyer status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [buyers, toast]);

  useEffect(() => {
    if (options.fetchOnMount) {
      fetchBuyers();
    }
  }, [options.fetchOnMount, options.page, options.pageSize, fetchBuyers]);

  return { 
    buyers, 
    loading, 
    error, 
    totalCount, 
    fetchBuyers,
    updateBuyerStatus
  };
}
