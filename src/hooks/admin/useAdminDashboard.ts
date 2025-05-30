
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminDashboardStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingSellerApprovals: number;
  openSupportCases: number;
  pendingWithdrawals: number;
  loading: boolean;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalTickets: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    pendingSellerApprovals: 0,
    openSupportCases: 0,
    pendingWithdrawals: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total tickets count
      const { count: totalTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      // Get total revenue from completed purchases
      const { data: revenueData } = await supabase
        .from('purchases')
        .select('price')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, purchase) => sum + (purchase.price || 0), 0) || 0;

      // Get this month's revenue for growth calculation
      const currentMonth = new Date();
      const firstDayThisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { data: thisMonthRevenue } = await supabase
        .from('purchases')
        .select('price')
        .eq('payment_status', 'completed')
        .gte('purchase_date', firstDayThisMonth.toISOString());

      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const firstDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastDayLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);

      const { data: lastMonthRevenue } = await supabase
        .from('purchases')
        .select('price')
        .eq('payment_status', 'completed')
        .gte('purchase_date', firstDayLastMonth.toISOString())
        .lte('purchase_date', lastDayLastMonth.toISOString());

      const thisMonthTotal = thisMonthRevenue?.reduce((sum, purchase) => sum + (purchase.price || 0), 0) || 0;
      const lastMonthTotal = lastMonthRevenue?.reduce((sum, purchase) => sum + (purchase.price || 0), 0) || 0;
      
      const monthlyGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

      // Get pending seller approvals
      const { count: pendingSellerApprovals } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller')
        .eq('approved', false)
        .eq('suspended', false);

      // Get open support cases
      const { count: openSupportCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get pending withdrawals
      const { count: pendingWithdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: totalUsers || 0,
        totalTickets: totalTickets || 0,
        totalRevenue: totalRevenue,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        pendingSellerApprovals: pendingSellerApprovals || 0,
        openSupportCases: openSupportCases || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return { stats, refreshStats: fetchDashboardStats };
};
