
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSellerDashboard = (user: any) => {
  const [winRate, setWinRate] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(0);
  const [profileComplete, setProfileComplete] = useState<boolean>(true);
  const [performanceData, setPerformanceData] = useState<Array<{name: string; sales: number}>>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);

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
        
        // Fetch total revenue
        const { data: salesData, error: salesError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', user.id);
        
        if (salesError) throw salesError;
        if (salesData && salesData.length > 0) {
          const revenue = salesData.reduce((sum, purchase) => sum + (purchase.price || 0), 0);
          setTotalRevenue(revenue);
          setTotalSales(salesData.length);
        }

        // Generate sample performance data for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const sampleData = months.map(month => ({
          name: month,
          sales: Math.floor(Math.random() * 1000) + 100
        }));
        setPerformanceData(sampleData);
        setMonthlyGrowth(Math.random() * 20 - 10); // Random growth between -10% and +10%

        // Check if profile is complete (has bank details)
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('*')
          .eq('user_id', user.id);
        
        if (bankError) throw bankError;
        setProfileComplete(bankData && bankData.length > 0);

        // Fetch recent sales
        const { data: recentData, error: recentError } = await supabase
          .from('purchases')
          .select(`
            id, 
            price, 
            purchase_date,
            is_winner,
            profiles!purchases_buyer_id_fkey (username, avatar_url),
            tickets (title)
          `)
          .eq('seller_id', user.id)
          .order('purchase_date', { ascending: false })
          .limit(5);
        
        if (recentError) throw recentError;
        setRecentSales(recentData || []);
        
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
    totalSales,
    totalRevenue,
    winRate,
    averageRating,
    ticketsSold,
    subscribersCount,
    monthlyGrowth,
    profileComplete,
    performanceData,
    recentSales
  };
};
