
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Ticket, Star, Trophy, Gift, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tickets Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{dashboardData.ticketsPurchased}</p>
                    <Link to="/buyer/purchases" className="text-xs hover:underline text-betting-green">View purchases</Link>
                  </div>
                  <Ticket className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Winning Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{dashboardData.winningTickets}</p>
                    {dashboardData.ticketsPurchased > 0 && (
                      <p className="text-xs text-green-500">
                        {Math.round((dashboardData.winningTickets / dashboardData.ticketsPurchased) * 100)}% win rate
                      </p>
                    )}
                  </div>
                  <Trophy className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{dashboardData.pendingReviews}</p>
                    <p className="text-xs">Rate seller performance</p>
                  </div>
                  <Star className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Credit Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {creditBalance === null ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">R {creditBalance.toFixed(2)}</p>
                    <Link to="/user/wallet" className="text-xs hover:underline text-betting-green">Manage wallet</Link>
                  </div>
                  <Wallet className="h-8 w-8 text-betting-green opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Purchases Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="betting-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Purchases</CardTitle>
                <Link to="/buyer/purchases" className="text-betting-green hover:underline text-sm">
                  View all
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
              ) : dashboardData.ticketsPurchased === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet</p>
                  <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                    <Link to="/tickets">Browse Tickets</Link>
                  </Button>
                </div>
              ) : (
                // We'll fetch actual recent purchases in the next phase
                <div className="text-center py-6">
                  <Link to="/buyer/purchases">
                    <Button className="bg-betting-green hover:bg-betting-green-dark">
                      View Purchase History
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
                    <Star className="mr-2 h-4 w-4" />
                    View Support Cases
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

export default BuyerDashboard;
