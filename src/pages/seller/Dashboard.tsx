
import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket, CreditCard, Award, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import StatCard from "@/components/seller/dashboard/StatCard";
import ProfileIncompleteAlert from "@/components/seller/dashboard/ProfileIncompleteAlert";
import RecentSalesCard from "@/components/seller/dashboard/RecentSalesCard";
import SupportCard from "@/components/seller/dashboard/SupportCard";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const { 
    loading, 
    totalSales, 
    ticketsSold, 
    winRate, 
    profileComplete 
  } = useSellerDashboard(currentUser);

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Link to="/seller/tickets/create">
            <Button className="bg-betting-green hover:bg-betting-green-dark flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Ticket
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={`R ${totalSales.toFixed(2)}`}
            icon={Ticket}
            subtitle="Lifetime earnings"
            loading={loading}
          />
          
          <StatCard
            title="Tickets Sold"
            value={ticketsSold}
            icon={CreditCard}
            loading={loading}
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
            loading={loading}
          />
          
          <StatCard
            title="Available Balance"
            value={creditBalance !== null ? `R ${creditBalance.toFixed(2)}` : ""}
            icon={Wallet}
            subtitle="Ready to withdraw"
            loading={creditBalance === null}
            action={
              <Button size="sm" variant="outline" asChild>
                <Link to="/seller/withdrawals">Withdraw</Link>
              </Button>
            }
          />
        </div>
        
        <ProfileIncompleteAlert visible={!profileComplete} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentSalesCard loading={loading} ticketsSold={ticketsSold} />
          <SupportCard />
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
