
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface UseSellersOptions {
  fetchOnMount?: boolean;
  limit?: number;
  sortBy?: string; // Add sort option
}

export function useSellers(options: UseSellersOptions = { fetchOnMount: true, limit: 3, sortBy: "sales" }) {
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If sorting by sales, use the public leaderboard function
      if (options.sortBy === "sales") {
        const now = new Date();
        // Go back one year for all-time stats
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const { data: topSellers, error: leaderboardError } = await supabase.rpc(
          'get_public_leaderboard', 
          { 
            start_date: oneYearAgo.toISOString(), 
            end_date: now.toISOString(),
            result_limit: options.limit || 10
          }
        );
        
        if (leaderboardError) throw leaderboardError;
        
        const mappedSellers = topSellers.map((seller: any) => ({
          id: seller.id,
          username: seller.username || "Anonymous",
          avatar_url: seller.avatar_url,
          role: "seller" as const,
          loyaltyPoints: 0,
          sales_count: seller.sales_count, // Include sales count from leaderboard
          average_rating: seller.average_rating,
          ranking: seller.rank
        }));
        
        setSellers(mappedSellers);
      } else {
        // Default query if not sorting by sales
        let query = supabase
          .from("profiles")
          .select("*")
          .eq("role", "seller")
          .eq("approved", true)
          .eq("suspended", false);
          
        // Apply limit if specified
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;

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
          avatar_url: seller.avatar_url,
          credit_balance: seller.credit_balance,
        }));

        console.log("Fetched sellers:", mappedSellers);
        setSellers(mappedSellers);
      }
      
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
  }, [toast, options.limit, options.sortBy]);

  useEffect(() => {
    if (options.fetchOnMount) {
      fetchSellers();
    }
  }, [options.fetchOnMount, fetchSellers]);

  return { sellers, loading, error, fetchSellers };
}
