
import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket, CreditCard, Award, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import StatCard from "@/components/seller/dashboard/StatCard";
import PerformanceChart from "@/components/seller/dashboard/PerformanceChart";
import SalesTipsCard from "@/components/seller/dashboard/SalesTipsCard";
import ProfileIncompleteAlert from "@/components/seller/dashboard/ProfileIncompleteAlert";
import RecentSalesCard from "@/components/seller/dashboard/RecentSalesCard";
import SupportCard from "@/components/seller/dashboard/SupportCard";
import { formatCurrency } from "@/utils/formatting";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const { 
    isLoading, 
    totalSales,
    totalRevenue, 
    ticketsSold, 
    winRate, 
    monthlyGrowth,
    profileComplete,
    performanceData,
    recentSales,
    subscribersCount
  } = useSellerDashboard(currentUser);

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser?.username || "Seller"}</p>
          </div>
          <Link to="/seller/tickets/create">
            <Button className="bg-betting-green hover:bg-betting-green-dark flex items-center gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Create New Ticket
            </Button>
          </Link>
        </div>
        
        {!profileComplete && <ProfileIncompleteAlert visible={true} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={formatCurrency(totalRevenue || 0)}
            icon={Ticket}
            subtitle="Lifetime earnings"
            loading={isLoading}
          />
          
          <StatCard
            title="Tickets Sold"
            value={ticketsSold}
            icon={CreditCard}
            loading={isLoading}
            action={
              <Link to="/seller/tickets" className="text-xs hover:underline text-betting-green">
                View tickets
              </Link>
            }
          />
          
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(0)}%`}
            icon={Award}
            subtitle="Based on rated tickets"
            loading={isLoading}
          />
          
          <StatCard
            title="Subscribers"
            value={subscribersCount}
            icon={Wallet}
            subtitle="People following you"
            loading={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart 
              loading={isLoading} 
              monthlyGrowth={monthlyGrowth} 
              data={performanceData} 
            />
          </div>
          <div>
            <SalesTipsCard />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentSalesCard loading={isLoading} sales={recentSales} />
          </div>
          <div>
            <SupportCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
