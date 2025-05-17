
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket, CreditCard, Award, AlertCircle, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    ticketsSold: 0,
    winRate: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get total sales amount
        const { data: salesData, error: salesError } = await supabase
          .from('purchases')
          .select('price')
          .eq('seller_id', currentUser.id);
          
        const totalSales = salesData?.reduce((sum, item) => sum + parseFloat(item.price), 0) || 0;
        
        // Get tickets sold count
        const { count: ticketsCount, error: ticketsError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', currentUser.id);
          
        // Get winning tickets count
        const { count: winningCount, error: winningError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', currentUser.id)
          .eq('is_winner', true);
        
        // Check if profile has bank details
        const { data: bankData, error: bankError } = await supabase
          .from('bank_details')
          .select('id')
          .eq('user_id', currentUser.id);
          
        setProfileComplete(bankData && bankData.length > 0);
        
        // Calculate win rate
        const winRate = ticketsCount > 0 ? (winningCount / ticketsCount) * 100 : 0;
        
        setDashboardData({
          totalSales: totalSales,
          ticketsSold: ticketsCount || 0,
          winRate: winRate,
          monthlyGrowth: 0 // Would need more complex time-series analysis for real growth
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

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
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">R {dashboardData.totalSales.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                  </div>
                  <Ticket className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{dashboardData.ticketsSold}</p>
                    <Link to="/seller/tickets" className="text-xs hover:underline text-betting-green">
                      View tickets
                    </Link>
                  </div>
                  <CreditCard className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{dashboardData.winRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Based on rated tickets</p>
                  </div>
                  <Award className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {creditBalance === null ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">R {creditBalance.toFixed(2)}</p>
                    <p className="text-xs">Ready to withdraw</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/seller/withdrawals">Withdraw</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Account Status Alert - only show if profile is incomplete */}
        {!profileComplete && (
          <Card className="betting-card mb-8 border-yellow-500/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="bg-yellow-500/20 p-2 rounded-full h-fit">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add your bank details to receive payments from your ticket sales.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/seller/profile">Complete Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recent Sales & Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="betting-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sales</CardTitle>
                <Link to="/seller/tickets" className="text-betting-green hover:underline text-sm">
                  View all tickets
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : dashboardData.ticketsSold === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't sold any tickets yet</p>
                  <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                    <Link to="/seller/tickets/create">Create Your First Ticket</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Link to="/seller/tickets">
                    <Button className="bg-betting-green hover:bg-betting-green-dark">
                      View Sales History
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link to="/user/wallet" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Wallet className="mr-2 h-4 w-4" />
                    Manage Wallet
                  </Button>
                </Link>
                <Link to="/user/cases" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Support Cases
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
