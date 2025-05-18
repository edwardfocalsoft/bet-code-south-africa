
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Award, Star } from "lucide-react";
import { formatDate } from "@/utils/formatting";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface SellerStats {
  id: string;
  username: string;
  salesCount: number;
  averageRating: number;
  rank: number;
  avatar_url?: string;
}

const SellersLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<SellerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Calculate week start (Monday) and end (Sunday)
    const calculateWeekDates = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate the date of Monday (start of week)
      // If today is Sunday (0), we need to go back 6 days
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      
      // Calculate the date of Sunday (end of week)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      setWeekStart(monday);
      setWeekEnd(sunday);
    };
    
    calculateWeekDates();
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const start = weekStart.toISOString();
      const end = weekEnd.toISOString();
      
      // First, get all sales for the week grouped by seller
      const { data: salesData, error: salesError } = await supabase
        .from('purchases')
        .select(`
          seller_id,
          seller:seller_id (id, username, avatar_url)
        `)
        .gte('purchase_date', start)
        .lte('purchase_date', end);
        
      if (salesError) throw salesError;
      
      // Count sales by seller
      const salesBySellerMap = new Map<string, SellerStats>();
      
      salesData?.forEach(purchase => {
        const sellerId = purchase.seller_id;
        const sellerProfile = purchase.seller;
        
        if (!salesBySellerMap.has(sellerId)) {
          salesBySellerMap.set(sellerId, {
            id: sellerId,
            username: sellerProfile?.username || 'Unknown',
            avatar_url: sellerProfile?.avatar_url,
            salesCount: 0,
            averageRating: 0,
            rank: 0
          });
        }
        
        const sellerData = salesBySellerMap.get(sellerId)!;
        sellerData.salesCount += 1;
      });
      
      // Get average ratings for each seller
      for (const sellerId of salesBySellerMap.keys()) {
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('score')
          .eq('seller_id', sellerId);
          
        if (!ratingsError && ratingsData && ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, item) => sum + item.score, 0);
          const average = totalRating / ratingsData.length;
          const sellerData = salesBySellerMap.get(sellerId)!;
          sellerData.averageRating = parseFloat(average.toFixed(1));
        }
      }
      
      // Convert to array and sort by sales count (descending)
      const leaderboardData = Array.from(salesBySellerMap.values())
        .sort((a, b) => b.salesCount - a.salesCount)
        .map((seller, index) => ({
          ...seller,
          rank: index + 1
        }));
      
      // If no sales data is found, show appropriate message
      if (leaderboardData.length === 0) {
        setError("No sales data found for the current week.");
      }
      
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      console.error('Error fetching leaderboard data:', error);
      setError("Failed to load leaderboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center">
          <Award className="h-5 w-5 text-yellow-500 mr-1" fill="#eab308" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center">
          <Award className="h-5 w-5 text-gray-300 mr-1" fill="#d1d5db" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center">
          <Award className="h-5 w-5 text-amber-700 mr-1" fill="#b45309" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    } else {
      return <span className="font-bold">{rank}</span>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="mr-1 font-semibold">{rating.toFixed(1)}</span>
        <Star className="h-4 w-4 text-yellow-500" fill="#eab308" />
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Sellers Leaderboard</h1>
        <p className="text-muted-foreground mb-6">
          Top performing sellers for the week of {formatDate(weekStart.toISOString())} to {formatDate(weekEnd.toISOString())}
        </p>
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle className="text-xl">Weekly Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
                <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">
                  The leaderboard resets every Monday at midnight.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-center">Weekly Sales</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="w-16">
                          {renderRankBadge(seller.rank)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {seller.username}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-betting-green font-semibold">{seller.salesCount}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {renderStars(seller.averageRating)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/sellers/${seller.id}`}
                            className="text-betting-green hover:underline"
                          >
                            View Profile
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellersLeaderboard;
