
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

interface DashboardData {
  totalSales: number;
  ticketsSold: number;
  winRate: number;
  monthlyGrowth: number;
  profileComplete: boolean;
}

export const useSellerDashboard = (currentUser: User | null) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 0,
    ticketsSold: 0,
    winRate: 0,
    monthlyGrowth: 0,
    profileComplete: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get total sales amount
        const { data: salesData, error: salesError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', currentUser.id);
          
        if (salesError) throw salesError;
        const totalSales = salesData?.reduce((sum, item) => sum + parseFloat(item.price), 0) || 0;
        
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
        const winRate = ticketsCount > 0 ? (winningCount / ticketsCount) * 100 : 0;
        
        setDashboardData({
          totalSales: totalSales,
          ticketsSold: ticketsCount || 0,
          winRate: winRate,
          monthlyGrowth: 0,
          profileComplete: bankData && bankData.length > 0
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  return {
    loading,
    ...dashboardData
  };
};
