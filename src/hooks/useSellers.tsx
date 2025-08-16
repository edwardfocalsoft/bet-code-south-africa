
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
        // Get all approved sellers
        const { data: sellersWithStats, error: sellersError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            verified
          `)
          .eq('role', 'seller')
          .eq('approved', true)
          .eq('suspended', false);

        if (sellersError) throw sellersError;

        // Get sales data for each seller including free tickets
        const sellersWithSalesData = await Promise.all(
          sellersWithStats.map(async (seller) => {
            // Count all purchases (including free tickets) for all time
            const { count: salesCount } = await supabase
              .from('purchases')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', seller.id)
              .eq('payment_status', 'completed');

            // Get total sales value (excluding free tickets for monetary calculations)
            const { data: salesData } = await supabase
              .from('purchases')
              .select('price')
              .eq('seller_id', seller.id)
              .eq('payment_status', 'completed');

            // Get average rating
            const { data: ratingsData } = await supabase
              .from('ratings')
              .select('score')
              .eq('seller_id', seller.id);

            const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
            const averageRating = ratingsData?.length 
              ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / ratingsData.length 
              : 0;

            return {
              id: seller.id,
              username: seller.username || "Anonymous",
              avatar_url: seller.avatar_url,
              role: "seller" as const,
              loyaltyPoints: 0,
              sales_count: salesCount || 0,
              average_rating: Number(averageRating.toFixed(1)),
              ranking: 0, // Will be assigned after sorting
              verified: seller.verified || false,
              total_sales: totalSales
            };
          })
        );

        // Sort by sales count (including free tickets) and assign ranking
        const sortedSellers = sellersWithSalesData
          .sort((a, b) => b.sales_count - a.sales_count)
          .slice(0, options.limit || 10)
          .map((seller, index) => ({
            ...seller,
            ranking: index + 1
          }));
        
        console.log("Fetched top tipsters (including free tickets):", sortedSellers);
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
