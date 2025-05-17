
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSellerDashboard = (user: any) => {
  const [winRate, setWinRate] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total tickets sold
        const { count: soldCount, error: soldError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id);
        
        if (soldError) throw soldError;
        setTicketsSold(soldCount || 0);
        
        // Fetch winning tickets
        const { count: winCount, error: winError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .eq('is_winner', true);
        
        if (winError) throw winError;
        setWinRate(soldCount ? Math.round((winCount / soldCount) * 100) : 0);
        
        // Fetch ratings
        const { data: ratingData, error: ratingError } = await supabase
          .from('ratings')
          .select('score')
          .eq('seller_id', user.id);
        
        if (ratingError) throw ratingError;
        if (ratingData && ratingData.length > 0) {
          const average = ratingData.reduce((sum, rating) => sum + rating.score, 0) / ratingData.length;
          setAverageRating(Number(average.toFixed(1)));
        }

        // Fetch subscribers count
        const { count: subCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id);
          
        if (subError) throw subError;
        setSubscribersCount(subCount || 0);
        
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, [user]);

  return {
    isLoading,
    winRate,
    averageRating,
    ticketsSold,
    subscribersCount
  };
};
