
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
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const getDateRange = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const { start, end } = getDateRange(timeframe);
      
      const { data, error } = await supabase.rpc('get_public_leaderboard', {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        result_limit: 10
      });

      if (error) throw error;
      return data as LeaderboardEntry[];
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Sellers Leaderboard</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Top performing sellers based on sales and ratings
          </p>
          
          <div className="flex gap-2 mb-6">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                onClick={() => setTimeframe(period)}
                className={timeframe === period ? "bg-betting-green hover:bg-betting-green-dark" : ""}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {!leaderboard?.length ? (
          <EmptyLeaderboard message="No sellers found for this period" />
        ) : (
          <div className="space-y-4">
            {leaderboard.map((seller, index) => (
              <Card key={seller.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <SellerRankBadge rank={seller.rank} />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar_url} alt={seller.username} />
                        <AvatarFallback>{seller.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{seller.username}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {seller.sales_count} tickets sold
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {formatCurrency(seller.total_sales)} earned
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <RatingDisplay rating={seller.average_rating} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellersLeaderboard;
