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
        // Fetch active tickets (tickets with kickoff time in the future)
        const now = new Date().toISOString();
        const { count: activeTicketsCount, error: activeTicketsError } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .gt('kickoff_time', now)
          .eq('is_hidden', false);
        
        if (activeTicketsError) throw activeTicketsError;
        setTicketsSold(activeTicketsCount || 0);
        
        // Fetch total tickets sold (completed purchases)
        const { count: soldCount, error: soldError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .eq('payment_status', 'completed');
        
        if (soldError) throw soldError;
        setTotalSales(soldCount || 0);
        
        // Fetch winning tickets
        const { count: winCount, error: winError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .eq('is_winner', true)
          .eq('payment_status', 'completed');
        
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
          .eq('seller_id', user.id)
          .eq('payment_status', 'completed');
        
        if (salesError) throw salesError;
        if (salesData && salesData.length > 0) {
          const revenue = salesData.reduce((sum, purchase) => sum + (purchase.price || 0), 0);
          setTotalRevenue(revenue);
        }

        // Fetch monthly performance data for the past 6 months using real database data
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('purchases')
          .select('price, purchase_date')
          .eq('seller_id', user.id)
          .eq('payment_status', 'completed')
          .gte('purchase_date', sixMonthsAgo.toISOString())
          .order('purchase_date', { ascending: true });
          
        if (monthlyError) throw monthlyError;
        
        // Process real monthly data
        if (monthlyData && monthlyData.length > 0) {
          // Create a map to store sales count for each month
          const monthlySalesCount: Record<string, number> = {};
          
          // Initialize monthlySalesCount with 0 for the past 6 months
          for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = monthDate.toLocaleString('default', { month: 'short' });
            monthlySalesCount[monthKey] = 0;
          }
          
          // Count sales for each month
          monthlyData.forEach(sale => {
            const saleDate = new Date(sale.purchase_date);
            const monthKey = saleDate.toLocaleString('default', { month: 'short' });
            
            if (monthlySalesCount[monthKey] !== undefined) {
              monthlySalesCount[monthKey] += 1; // Count number of sales, not revenue
            }
          });
          
          // Convert to array format required by the chart
          const formattedData = Object.entries(monthlySalesCount)
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return months.indexOf(a[0]) - months.indexOf(b[0]);
            })
            .slice(-6) // Take only the most recent 6 months
            .map(([month, sales]) => ({
              name: month,
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
              setMonthlyGrowth(100);
            } else {
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

        // Fetch recent sales (limit to latest 5)
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
          .eq('payment_status', 'completed')
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
