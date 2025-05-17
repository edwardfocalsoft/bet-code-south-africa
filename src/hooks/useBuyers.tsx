
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
      
      console.log("Fetching buyers - started");

      // Get total count first for pagination - only buyers
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

      console.log(`Fetched ${data?.length || 0} buyers`);

      if (!data || data.length === 0) {
        setBuyers([]);
        setLoading(false);
        return;
      }

      // Get purchase counts for each buyer
      const buyerIds = data.map((buyer: any) => buyer.id);
      
      // Get purchases for all buyers in one query
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select("buyer_id")
        .in("buyer_id", buyerIds);
          
      if (purchasesError) throw purchasesError;
      
      // Count purchases by buyer_id
      const purchaseCounts: Record<string, number> = {};
      if (purchasesData) {
        purchasesData.forEach((purchase: { buyer_id: string }) => {
          purchaseCounts[purchase.buyer_id] = (purchaseCounts[purchase.buyer_id] || 0) + 1;
        });
      }

      const mappedBuyers = data.map((buyer: any) => ({
        id: buyer.id,
        email: buyer.email,
        role: buyer.role,
        username: buyer.username || "Anonymous",
        createdAt: new Date(buyer.created_at),
        approved: buyer.approved || false,
        suspended: buyer.suspended || false,
        lastActive: buyer.updated_at ? new Date(buyer.updated_at) : new Date(buyer.created_at),
        purchasesCount: purchaseCounts[buyer.id] || 0,
        loyaltyPoints: buyer.loyalty_points || 0,
        creditBalance: buyer.credit_balance || 0,
      }));

      setBuyers(mappedBuyers);
      console.log("Buyers data processed successfully");
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
      // Ensure loading state is always set to false when done
      setLoading(false);
      console.log("Buyers fetch complete, loading set to false");
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
    let isMounted = true;
    
    if (options.fetchOnMount) {
      fetchBuyers().catch(err => {
        if (isMounted) {
          console.error("Error in fetchBuyers effect:", err);
          setLoading(false);
          setError("Failed to fetch buyers");
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
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
