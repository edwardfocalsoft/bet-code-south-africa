import { useState, useEffect, useCallback } from "react";
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

  const fetchSubscribersCount = useCallback(async (userId: string) => {
    try {
      console.log("Fetching dashboard subscribers count for user:", userId);
      
      // Using count with head: true to efficiently count rows
      const { count, error } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", userId);
        
      if (error) throw error;
      
      console.log("Dashboard subscriber count result:", count);
      return count || 0;
    } catch (error: any) {
      console.error("Error fetching dashboard subscribers count:", error);
      return 0;
    }
  }, []);

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

        // Fetch subscribers count directly with our helper function
        const subCount = await fetchSubscribersCount(user.id);
        setSubscribersCount(subCount);
        
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

        // Fetch monthly performance data for the past 6 months
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // First day of 6 months ago
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('purchases')
          .select('price, purchase_date')
          .eq('seller_id', user.id)
          .gte('purchase_date', sixMonthsAgo.toISOString())
          .order('purchase_date', { ascending: true });
          
        if (monthlyError) throw monthlyError;
        
        // Process monthly data
        if (monthlyData && monthlyData.length > 0) {
          // Create a map to store sales for each month
          const monthlySales: Record<string, number> = {};
          
          // Initialize monthlySales with 0 for the past 6 months
          for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = monthDate.toLocaleString('default', { month: 'short' }) + ' ' + monthDate.getFullYear();
            monthlySales[monthKey] = 0;
          }
          
          // Sum up sales for each month
          monthlyData.forEach(sale => {
            const saleDate = new Date(sale.purchase_date);
            const monthKey = saleDate.toLocaleString('default', { month: 'short' }) + ' ' + saleDate.getFullYear();
            
            if (monthlySales[monthKey] !== undefined) {
              monthlySales[monthKey] += Number(sale.price);
            }
          });
          
          // Convert to array format required by the chart
          const formattedData = Object.entries(monthlySales)
            .sort((a, b) => {
              // Parse month names to get proper sorting
              const [monthA, yearA] = a[0].split(' ');
              const [monthB, yearB] = b[0].split(' ');
              const dateA = new Date(`${monthA} 1, ${yearA}`);
              const dateB = new Date(`${monthB} 1, ${yearB}`);
              return dateA.getTime() - dateB.getTime();
            })
            .slice(-6) // Take only the most recent 6 months
            .map(([month, sales]) => ({
              name: month.split(' ')[0], // Just use the month abbreviation for the chart
              sales: sales
            }));
          
          setPerformanceData(formattedData);
          
          // Calculate monthly growth (comparing current month with previous month)
          if (formattedData.length >= 2) {
            const currentMonth = formattedData[formattedData.length - 1].sales;
            const previousMonth = formattedData[formattedData.length - 2].sales;
            
            if (previousMonth > 0) {
              const growth = ((currentMonth - previousMonth) / previousMonth) * 100;
              setMonthlyGrowth(parseFloat(growth.toFixed(1)));
            } else if (currentMonth > 0) {
              // If previous month was 0, but current month has sales, show 100% growth
              setMonthlyGrowth(100);
            } else {
              // Both months are 0
              setMonthlyGrowth(0);
            }
          }
        } else {
          setPerformanceData([]);
          setMonthlyGrowth(0);
        }

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
  }, [user, fetchSubscribersCount]);

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
