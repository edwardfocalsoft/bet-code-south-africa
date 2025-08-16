
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { BuyerStats, UseBuyersOptions, UseBuyersResult } from "./types";
import { fetchBuyerStats } from "./buyerStats";
import { fetchBuyersData } from "./fetchBuyers";
import { updateBuyerStatus as updateStatus, resendVerificationEmail as resendEmail } from "./buyerActions";

export function useBuyers(options: UseBuyersOptions = { fetchOnMount: true, page: 1, pageSize: 10 }): UseBuyersResult {
  const [buyers, setBuyers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<BuyerStats>({
    totalBuyers: 0,
    newBuyersLast30Days: 0,
    totalProcessedAmount: 0
  });
  const { toast } = useToast();

  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching punters - started");

      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "buyer");

      if (countError) throw countError;
      
      if (count !== null) {
        setTotalCount(count);
      }

      // Fetch punter statistics
      const buyerStats = await fetchBuyerStats();
      setStats(buyerStats);

      // Fetch punter data with filters and pagination
      const buyerData = await fetchBuyersData(options);
      setBuyers(buyerData);

      console.log(`Fetched ${buyerData.length} punters`);
      
    } catch (error: any) {
      console.error("Error fetching punters:", error);
      setError(error.message || "Failed to fetch punters");
      toast({
        title: "Error",
        description: "Failed to load punters. Please try again later.",
        variant: "destructive",
      });
      // Set empty array to prevent infinite loading state
      setBuyers([]);
    } finally {
      // Ensure loading state is always set to false when done
      setLoading(false);
      console.log("Punters fetch complete, loading set to false");
    }
  }, [options.page, options.pageSize, options.filters, toast]);

  const updateBuyerStatus = useCallback(async (
    buyerId: string,
    updates: { approved?: boolean; suspended?: boolean }
  ) => {
    const success = await updateStatus(buyerId, updates);
    
    if (success) {
      // Update local state
      setBuyers(buyers.map(buyer => {
        if (buyer.id === buyerId) {
          return { ...buyer, ...updates };
        }
        return buyer;
      }));
    } else {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
    
    return success;
  }, [buyers, toast]);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const success = await resendEmail(email);
    
    if (success) {
      toast({
        title: "Success",
        description: "Verification email has been resent.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    }
    
    return success;
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    
    if (options.fetchOnMount) {
      fetchBuyers().catch(err => {
        if (isMounted) {
          console.error("Error in fetchBuyers effect:", err);
          setLoading(false);
          setError("Failed to fetch punters");
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [options.fetchOnMount, options.page, options.pageSize, options.filters, fetchBuyers]);

  return { 
    buyers, 
    loading, 
    error, 
    totalCount, 
    stats,
    fetchBuyers,
    updateBuyerStatus,
    resendVerificationEmail
  };
}
