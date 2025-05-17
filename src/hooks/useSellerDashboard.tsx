
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getSellerStats, getSellerPerformanceData, getRecentSales } from "@/utils/sqlFunctions";

export interface SellerDashboardData {
  totalSales: number;
  totalRevenue: number;
  ticketsSold: number;
  winRate: number;
  averageRating: number;
  monthlyGrowth: number;
  profileComplete: boolean;
  performanceData: Array<{name: string, sales: number}>;
  recentSales: any[];
  isLoading: boolean;
}

export const useSellerDashboard = (currentUser: User | null) => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<SellerDashboardData>({
    totalSales: 0,
    totalRevenue: 0,
    ticketsSold: 0,
    winRate: 0,
    averageRating: 0,
    monthlyGrowth: 0,
    profileComplete: true,
    performanceData: [],
    recentSales: [],
    isLoading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Check if profile has bank details
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('id')
          .eq('user_id', currentUser.id);
          
        if (bankError) throw bankError;
        
        // Get seller statistics
        const stats = await getSellerStats(currentUser.id);
        
        // Get performance data for chart
        const performance = await getSellerPerformanceData(currentUser.id);
        
        // Get recent sales
        const recentSales = await getRecentSales(currentUser.id);
        
        setDashboardData({
          totalSales: stats?.totalRevenue || 0,
          totalRevenue: stats?.totalRevenue || 0,
          ticketsSold: stats?.totalSales || 0,
          winRate: stats?.winRate || 0,
          averageRating: stats?.averageRating || 0,
          monthlyGrowth: performance?.monthlyGrowth || 0,
          profileComplete: bankData && bankData.length > 0,
          performanceData: performance?.performanceData || [],
          recentSales: recentSales || [],
          isLoading: false
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
