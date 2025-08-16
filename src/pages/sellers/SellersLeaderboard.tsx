import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/sellers/leaderboard/LoadingState";
import EmptyLeaderboard from "@/components/sellers/leaderboard/EmptyLeaderboard";
import SellerRankBadge from "@/components/sellers/leaderboard/SellerRankBadge";
import RatingDisplay from "@/components/sellers/leaderboard/RatingDisplay";
import { Link } from "react-router-dom";
interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar_url: string;
  sales_count: number;
  total_sales: number;
  average_rating: number;
}
const SellersLeaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'year'>('week');
  const getDateRange = (period: 'week' | 'year') => {
    const now = new Date();
    const start = new Date();
    switch (period) {
      case 'week':
        // Get start of current week (Monday)
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        start.setDate(now.getDate() + mondayOffset);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return {
      start,
      end: now
    };
  };
  const {
    data: leaderboard,
    isLoading,
    error
  } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const {
        start,
        end
      } = getDateRange(timeframe);

      // Get sellers with sales data including free tickets
      const {
        data: sellersWithStats,
        error: sellersError
      } = await supabase.from('profiles').select(`
          id,
          username,
          avatar_url,
          verified
        `).eq('role', 'seller').eq('approved', true).eq('suspended', false);
      if (sellersError) throw sellersError;

      // Get sales data for each seller including free tickets
      const sellersWithSalesData = await Promise.all(sellersWithStats.map(async seller => {
        // Count all purchases (including free tickets) within the date range
        const {
          count: salesCount
        } = await supabase.from('purchases').select('*', {
          count: 'exact',
          head: true
        }).eq('seller_id', seller.id).eq('payment_status', 'completed').gte('purchase_date', start.toISOString()).lte('purchase_date', end.toISOString());

        // Get total sales value (excluding free tickets for monetary calculations)
        const {
          data: salesData
        } = await supabase.from('purchases').select('price').eq('seller_id', seller.id).eq('payment_status', 'completed').gte('purchase_date', start.toISOString()).lte('purchase_date', end.toISOString());

        // Get average rating
        const {
          data: ratingsData
        } = await supabase.from('ratings').select('score').eq('seller_id', seller.id);
        const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
        const averageRating = ratingsData?.length ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / ratingsData.length : 0;
        return {
          id: seller.id,
          username: seller.username,
          avatar_url: seller.avatar_url,
          sales_count: salesCount || 0,
          total_sales: totalSales,
          average_rating: Number(averageRating.toFixed(1)),
          rank: 0 // Will be assigned after sorting
        };
      }));

      // Filter out sellers with no sales and sort by sales count
      const sellersWithSales = sellersWithSalesData.filter(seller => seller.sales_count > 0).sort((a, b) => b.sales_count - a.sales_count).map((seller, index) => ({
        ...seller,
        rank: index + 1
      }));
      return sellersWithSales;
    }
  });
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };
  if (isLoading) return <LoadingState />;
  if (error) return <EmptyLeaderboard message="Error loading leaderboard" />;
  return <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tipster Leaderboard</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Top performing sellers based on sales and ratings (includes free tickets)
          </p>
          
          <div className="flex gap-2 mb-6">
            {(['week', 'year'] as const).map(period => <Button key={period} variant={timeframe === period ? "default" : "outline"} onClick={() => setTimeframe(period)} className={timeframe === period ? "bg-betting-green hover:bg-betting-green-dark" : ""}>
                {period === 'week' ? 'This Week' : 'This Year'}
              </Button>)}
          </div>
        </div>

        {!leaderboard?.length ? <EmptyLeaderboard message="No sellers with sales found for this period" /> : <div className="space-y-4">
            {leaderboard.map((seller, index) => <Card key={seller.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <SellerRankBadge rank={seller.rank} />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar_url} alt={seller.username} />
                        <AvatarFallback>{seller.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <Link to={`/sellers/${seller.id}`} className="font-semibold text-lg hover:text-betting-green transition-colors">
                          {seller.username}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {seller.sales_count} tickets sold
                          </div>
                          {seller.total_sales > 0 && <div className="text-betting-green font-semibold">
                              {formatCurrency(seller.total_sales)} earned
                            </div>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <RatingDisplay rating={seller.average_rating} />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </Layout>;
};
export default SellersLeaderboard;