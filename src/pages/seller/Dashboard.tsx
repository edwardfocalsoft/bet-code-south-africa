
import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket, CreditCard, Award, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import StatCard from "@/components/seller/dashboard/StatCard";
import ProfileIncompleteAlert from "@/components/seller/dashboard/ProfileIncompleteAlert";
import RecentSalesCard from "@/components/seller/dashboard/RecentSalesCard";
import SupportCard from "@/components/seller/dashboard/SupportCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockPerformanceData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
];

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const { 
    loading, 
    totalSales, 
    ticketsSold, 
    winRate, 
    monthlyGrowth,
    profileComplete 
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
        
        {!profileComplete && (
          <ProfileIncompleteAlert visible={true} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={formatCurrency(totalSales)}
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
            value={creditBalance !== null ? formatCurrency(creditBalance) : ""}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="betting-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Overview</span>
                {monthlyGrowth > 0 ? (
                  <div className="flex items-center text-sm font-normal text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{monthlyGrowth.toFixed(1)}% from last month</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm font-normal text-red-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{monthlyGrowth.toFixed(1)}% from last month</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-betting-dark-gray/20 rounded-md">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockPerformanceData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#333", 
                          border: "1px solid #555",
                          borderRadius: "4px"
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="betting-card">
            <CardHeader>
              <CardTitle>Tips to Increase Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-betting-green/20 rounded-full p-1">
                    <Ticket className="h-4 w-4 text-betting-green" />
                  </div>
                  <span className="text-sm">Create tickets with detailed analysis to increase buyer confidence</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-betting-green/20 rounded-full p-1">
                    <TrendingUp className="h-4 w-4 text-betting-green" />
                  </div>
                  <span className="text-sm">Track your performance and focus on sports where you have the highest win rate</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-betting-green/20 rounded-full p-1">
                    <Award className="h-4 w-4 text-betting-green" />
                  </div>
                  <span className="text-sm">Maintain a high win rate to attract more subscribers and repeat customers</span>
                </li>
              </ul>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/seller/profile">Complete Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentSalesCard loading={loading} ticketsSold={ticketsSold} />
          <SupportCard />
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
