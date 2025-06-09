
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/seller/dashboard/StatCard";
import SinglePerformanceChart from "@/components/seller/dashboard/SinglePerformanceChart";
import RecentSalesCard from "@/components/seller/dashboard/RecentSalesCard";
import SalesTipsCard from "@/components/seller/dashboard/SalesTipsCard";
import ProfileIncompleteAlert from "@/components/seller/dashboard/ProfileIncompleteAlert";
import TransactionsTable from "@/components/seller/dashboard/TransactionsTable";
import NotifySubscribersDialog from "@/components/seller/dashboard/NotifySubscribersDialog";
import { Button } from "@/components/ui/button";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import { useAuth } from "@/contexts/auth";
import { Loader2, TrendingUp, Ticket, DollarSign, Star, ArrowRight } from "lucide-react";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    isLoading,
    totalSales,
    totalRevenue,
    winRate,
    averageRating,
    ticketsSold,
    activeTickets,
    subscribersCount,
    monthlyGrowth,
    profileComplete,
    performanceData,
    recentSales
  } = useSellerDashboard(currentUser);

  // Transform performanceData to match chart requirements
  const chartData = performanceData.map(item => ({
    period: item.name,
    sales: item.sales,
    revenue: item.sales * 100, // Approximate revenue for chart
    avgRating: averageRating || 0
  }));

  if (isLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <NotifySubscribersDialog subscribersCount={subscribersCount} />
        </div>
        
        <ProfileIncompleteAlert visible={!profileComplete} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={totalSales}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Tickets"
            value={activeTickets}
            icon={Ticket}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={`R${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Average Rating"
            value={averageRating?.toFixed(1) || "0.0"}
            icon={Star}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        <div className="mb-8">
          <SinglePerformanceChart 
            data={chartData}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentSalesCard sales={recentSales.slice(0, 3)} loading={isLoading} />
          <SalesTipsCard />
        </div>

        <div className="mb-8">
          <div className="betting-card">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Link to="/seller/transactions">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    View More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <TransactionsTable limit={3} showPagination={false} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
