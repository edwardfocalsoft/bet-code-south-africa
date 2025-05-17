
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  totalSales: number;
  ticketsSold: number;
  winRate: number;
  monthlyGrowth: number;
  profileComplete: boolean;
}

export const useSellerDashboard = (currentUser: User | null) => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 0,
    ticketsSold: 0,
    winRate: 0,
    monthlyGrowth: 0,
    profileComplete: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Get total sales amount
        const { data: salesData, error: salesError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', currentUser.id);
          
        if (salesError) throw salesError;
        const totalSales = salesData?.reduce((sum, item) => sum + parseFloat(String(item.price)), 0) || 0;
        
        // Get tickets sold count
        const { count: ticketsCount, error: ticketsError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', currentUser.id);
          
        if (ticketsError) throw ticketsError;
        
        // Get winning tickets count
        const { count: winningCount, error: winningError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', currentUser.id)
          .eq('is_winner', true);
        
        if (winningError) throw winningError;
        
        // Check if profile has bank details
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('id')
          .eq('user_id', currentUser.id);
          
        if (bankError) throw bankError;
        
        // Calculate win rate
        const winRate = ticketsCount && ticketsCount > 0 ? ((winningCount || 0) / ticketsCount) * 100 : 0;
        
        // Get monthly growth data (compare current month's sales to previous month)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        
        // Current month sales
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', currentUser.id)
          .gte('purchase_date', firstDayOfMonth);
          
        if (currentMonthError) throw currentMonthError;
        
        // Previous month sales
        const { data: prevMonthData, error: prevMonthError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', currentUser.id)
          .gte('purchase_date', firstDayOfPrevMonth)
          .lt('purchase_date', firstDayOfMonth);
          
        if (prevMonthError) throw prevMonthError;
        
        const currentMonthSales = currentMonthData?.reduce((sum, item) => sum + parseFloat(String(item.price)), 0) || 0;
        const prevMonthSales = prevMonthData?.reduce((sum, item) => sum + parseFloat(String(item.price)), 0) || 0;
        
        // Calculate monthly growth percentage
        const monthlyGrowth = prevMonthSales > 0 
          ? ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100
          : currentMonthSales > 0 ? 100 : 0;
        
        setDashboardData({
          totalSales: totalSales,
          ticketsSold: ticketsCount || 0,
          winRate: winRate,
          monthlyGrowth: monthlyGrowth,
          profileComplete: bankData && bankData.length > 0
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser, toast]);

  return {
    loading,
    ...dashboardData
  };
};
