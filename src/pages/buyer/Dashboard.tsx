
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import StatCard from "@/components/buyer/dashboard/StatCard";
import RecentPurchasesCard from "@/components/buyer/dashboard/RecentPurchasesCard";
import SupportCard from "@/components/buyer/dashboard/SupportCard";

const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const dashboardStats = [
    {
      title: "Available Credits",
      value: `R ${currentUser?.credit_balance?.toFixed(2) || '0.00'}`,
      subtitle: "Your current balance",
      trend: null
    },
    {
      title: "Tickets Purchased",
      value: "0",
      subtitle: "All time purchases",
      trend: null
    },
    {
      title: "Winning Tickets",
      value: "0",
      subtitle: "Success rate",
      trend: null
    }
  ];

  return (
    <Layout title="Dashboard" requireAuth={true} userRole="buyer">
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser?.username || 'Buyer'}</h1>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <StatCard 
              key={index} 
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
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
