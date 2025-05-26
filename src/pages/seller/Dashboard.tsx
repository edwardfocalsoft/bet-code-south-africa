
import React from "react";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/seller/dashboard/StatCard";
import EnhancedPerformanceChart from "@/components/seller/dashboard/EnhancedPerformanceChart";
import RecentSalesCard from "@/components/seller/dashboard/RecentSalesCard";
import SalesTipsCard from "@/components/seller/dashboard/SalesTipsCard";
import SupportCard from "@/components/seller/dashboard/SupportCard";
import ProfileIncompleteAlert from "@/components/seller/dashboard/ProfileIncompleteAlert";
import TransactionsTable from "@/components/seller/dashboard/TransactionsTable";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import { useAuth } from "@/contexts/auth";
import { Loader2, TrendingUp, Ticket, DollarSign, Star } from "lucide-react";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
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
  } = useSellerDashboard(currentUser);

  // Generate mock performance data for the chart
  const chartData = [
    { period: "Jan", sales: 12, revenue: 2400, avgRating: 4.2 },
    { period: "Feb", sales: 19, revenue: 3800, avgRating: 4.3 },
    { period: "Mar", sales: 15, revenue: 3000, avgRating: 4.1 },
    { period: "Apr", sales: 22, revenue: 4400, avgRating: 4.5 },
    { period: "May", sales: 18, revenue: 3600, avgRating: 4.4 },
    { period: "Jun", sales: 25, revenue: 5000, avgRating: 4.6 },
  ];

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
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
        
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
            value={ticketsSold}
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
          <EnhancedPerformanceChart 
            data={chartData}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentSalesCard sales={recentSales} loading={isLoading} />
          <SalesTipsCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TransactionsTable />
          </div>
          <SupportCard />
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
