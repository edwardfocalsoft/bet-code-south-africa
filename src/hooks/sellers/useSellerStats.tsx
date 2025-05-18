
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSellerStats } from "@/utils/sqlFunctions";

export interface SellerStatsData {
  totalSales: number;
  totalRevenue: number;
  winningCount: number;
  winRate: number;
  averageRating: number;
  totalRatings: number;
  followersCount?: number;
}

export const useSellerStats = (sellerId: string | undefined) => {
  const [stats, setStats] = useState<SellerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use existing utility function to get seller stats
        const sellerStats = await getSellerStats(sellerId);
        
        if (!sellerStats) {
          throw new Error("Failed to fetch seller statistics");
        }
        
        // Get followers count separately
        const { count: followersCount, error: followersError } = await supabase
          .from("subscriptions")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId);
          
        if (followersError) throw followersError;
        
        setStats({
          ...sellerStats,
          followersCount: followersCount || 0
        });
      } catch (error: any) {
        console.error("Error fetching seller stats:", error);
        setError(error.message || "Failed to fetch seller statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [sellerId]);

  return { stats, loading, error };
};

export default useSellerStats;
