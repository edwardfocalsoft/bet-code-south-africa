
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import StatCard from "@/components/buyer/dashboard/StatCard";
import RecentPurchasesCard from "@/components/buyer/dashboard/RecentPurchasesCard";
import SupportCard from "@/components/buyer/dashboard/SupportCard";
import { CreditCard, Ticket, Trophy } from "lucide-react";

const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance, isLoading: walletLoading } = useWallet();

  const dashboardStats = [
    {
      title: "Available Credits",
      value: creditBalance || 0,
      icon: <CreditCard className="h-8 w-8 text-betting-green" />,
      loading: walletLoading,
      subtitle: <p className="text-xs text-muted-foreground">Your current balance</p>
    },
    {
      title: "Tickets Purchased",
      value: 0,
      icon: <Ticket className="h-8 w-8 text-betting-green" />,
      loading: false,
      subtitle: <p className="text-xs text-muted-foreground">All time purchases</p>
    },
    {
      title: "Winning Tickets",
      value: 0,
      icon: <Trophy className="h-8 w-8 text-betting-green" />,
      loading: false,
      subtitle: <p className="text-xs text-muted-foreground">Success rate</p>
    }
  ];

  return (
    <Layout requireAuth={true} allowedRoles={["buyer"]}>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser?.username || 'Tipster'}</h1>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <StatCard 
              key={index} 
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              loading={stat.loading}
              subtitle={stat.subtitle}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Content - Recent Purchases */}
          <div className="lg:col-span-5">
            <RecentPurchasesCard />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Support Card */}
            <SupportCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;
