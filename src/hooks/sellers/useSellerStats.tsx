
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SellerStatsData {
  winRate: number;
  ticketsSold: number;
  followersCount: number; 
  averageRating: number;
  totalRatings: number;
}

export const useSellerStats = (sellerId: string | undefined) => {
  const [stats, setStats] = useState<SellerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`Fetching stats for seller: ${sellerId}`);
      
      try {
        // Get total sales count
        const { count: totalSales, error: salesError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId);
          
        if (salesError) throw salesError;
        console.log(`Total sales: ${totalSales}`);
        
        // Get winning tickets count for win rate
        const { count: winCount, error: winError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId)
          .eq("is_winner", true);
          
        if (winError) throw winError;
        console.log(`Winning tickets: ${winCount}`);
        
        // Calculate win rate
        const winRate = totalSales && totalSales > 0 && winCount !== null 
          ? Math.round((winCount / totalSales) * 100) 
          : 0;
        
        // Get followers count - Fixed query to correctly count all subscribers
        const { count: followersCount, error: followersError } = await supabase
          .from("subscriptions")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId);
          
        if (followersError) throw followersError;
        console.log(`Followers: ${followersCount}`);
        
        // Get average rating from ratings
        const { data: ratings, error: ratingsError } = await supabase
          .from("ratings")
          .select("score")
          .eq("seller_id", sellerId);
          
        if (ratingsError) throw ratingsError;
        
        let averageRating = 0;
        let totalRatings = 0;
        
        if (ratings && ratings.length > 0) {
          totalRatings = ratings.length;
          averageRating = parseFloat(
            (ratings.reduce((sum, item) => sum + item.score, 0) / totalRatings).toFixed(1)
          );
        }
        
        console.log(`Average rating: ${averageRating} (${totalRatings} ratings)`);
        
        setStats({
          winRate,
          ticketsSold: totalSales || 0,
          followersCount: followersCount || 0,
          averageRating,
          totalRatings
        });
      } catch (error: any) {
        console.error("Error fetching seller stats:", error);
        setError(error.message || "Failed to fetch seller statistics");
        
        // Set default values in case of error
        setStats({
          winRate: 0,
          ticketsSold: 0,
          followersCount: 0,
          averageRating: 0,
          totalRatings: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStats();
  }, [sellerId]);

  return { stats, loading, error };
};

export default useSellerStats;
