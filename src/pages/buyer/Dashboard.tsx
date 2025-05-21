
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Ticket, Trophy, Star, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/buyer/dashboard/StatCard";
import RecentPurchasesCard from "@/components/buyer/dashboard/RecentPurchasesCard";
import SupportCard from "@/components/buyer/dashboard/SupportCard";

const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    ticketsPurchased: 0,
    winningTickets: 0,
    pendingReviews: 0,
    loyaltyPoints: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get tickets purchased count
        const { count: ticketsCount, error: ticketsError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', currentUser.id);
          
        // Get winning tickets count
        const { count: winningCount, error: winningError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', currentUser.id)
          .eq('is_winner', true);
          
        // Get pending reviews count
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', currentUser.id)
          .eq('is_rated', false);
          
        // Get loyalty points
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('loyalty_points')
          .eq('id', currentUser.id)
          .single();
          
        setDashboardData({
          ticketsPurchased: ticketsCount || 0,
          winningTickets: winningCount || 0,
          pendingReviews: reviewsCount || 0,
          loyaltyPoints: profileData?.loyalty_points || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  // Calculate win rate safely
  const calculateWinRate = () => {
    if (!dashboardData.ticketsPurchased || dashboardData.ticketsPurchased === 0) {
      return "0";
    }
    return Math.round((dashboardData.winningTickets / dashboardData.ticketsPurchased) * 100).toString();
  };

  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tickets Purchased"
            value={dashboardData.ticketsPurchased}
            loading={loading}
            icon={<Ticket className="h-8 w-8 text-betting-green opacity-50" />}
            link={{ text: "View purchases", to: "/buyer/purchases" }}
          />
          
          <StatCard 
            title="Winning Tickets"
            value={dashboardData.winningTickets}
            loading={loading}
            icon={<Trophy className="h-8 w-8 text-betting-green opacity-50" />}
            subtitle={dashboardData.ticketsPurchased > 0 && (
              <p className="text-xs text-green-500">
                {calculateWinRate()}% win rate
              </p>
            )}
          />
          
          <StatCard 
            title="Pending Reviews"
            value={dashboardData.pendingReviews}
            loading={loading}
            icon={<Star className="h-8 w-8 text-betting-green opacity-50" />}
            subtitle={<p className="text-xs">Rate seller performance</p>}
          />
          
          <StatCard 
            title="Credit Balance"
            value={creditBalance !== null && creditBalance !== undefined ? parseFloat(creditBalance.toFixed(2)) : 0}
            loading={creditBalance === null || creditBalance === undefined}
            icon={<Wallet className="h-8 w-8 text-betting-green opacity-50" />}
            link={{ text: "Manage wallet", to: "/user/wallet" }}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentPurchasesCard />
          <SupportCard />
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;
