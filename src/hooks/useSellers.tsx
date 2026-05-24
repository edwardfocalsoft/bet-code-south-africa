
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface UseSellersOptions {
  fetchOnMount?: boolean;
  limit?: number;
  sortBy?: string;
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

      // If sorting by sales, get sellers with sales data including free tickets
      if (options.sortBy === "sales") {
        // Use SECURITY DEFINER RPC so anonymous visitors still see aggregated counts.
        const start = new Date('1970-01-01').toISOString();
        const end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { data: rows, error: rpcError } = await supabase.rpc('get_public_leaderboard', {
          start_date: start,
          end_date: end,
          result_limit: options.limit || 10,
        });

        if (rpcError) throw rpcError;

        // Pull verified flags in one batch
        const ids = (rows || []).map((r: any) => r.id);
        let verifiedMap: Record<string, boolean> = {};
        if (ids.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, verified')
            .in('id', ids);
          verifiedMap = Object.fromEntries((profs || []).map((p: any) => [p.id, !!p.verified]));
        }

        const sortedSellers = (rows || []).map((r: any, index: number) => ({
          id: r.id,
          username: r.username || 'Anonymous',
          avatar_url: r.avatar_url,
          role: 'seller' as const,
          loyaltyPoints: 0,
          sales_count: Number(r.sales_count) || 0,
          average_rating: Number(r.average_rating) || 0,
          ranking: index + 1,
          verified: verifiedMap[r.id] || false,
          total_sales: Number(r.total_sales) || 0,
        }));

        setSellers(sortedSellers);
      } else {
        // Default query if not sorting by sales
        let query = supabase
          .from("profiles")
          .select("*")
          .eq("role", "seller");
          
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
          verified: seller.verified || false,
          loyaltyPoints: seller.loyalty_points || 0,
          avatar_url: seller.avatar_url,
          credit_balance: seller.credit_balance,
        }));

        console.log("Fetched tipsters:", mappedSellers);
        setSellers(mappedSellers);
      }
      
    } catch (error: any) {
      console.error("Error fetching tipsters:", error);
      setError(error.message || "Failed to fetch tipsters");
      toast({
        title: "Error",
        description: "Failed to load tipsters. Please try again later.",
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
