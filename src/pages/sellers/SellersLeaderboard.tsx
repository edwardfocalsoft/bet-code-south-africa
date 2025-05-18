
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import LeaderboardHeader from "@/components/sellers/leaderboard/LeaderboardHeader";
import LeaderboardTable from "@/components/sellers/leaderboard/LeaderboardTable";
import EmptyLeaderboard from "@/components/sellers/leaderboard/EmptyLeaderboard";
import LoadingState from "@/components/sellers/leaderboard/LoadingState";
import { SellerStats } from "@/components/sellers/leaderboard/LeaderboardTable";

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
          profiles:profiles!purchases_seller_id_fkey(id, username, avatar_url)
        `)
        .gte('purchase_date', start)
        .lte('purchase_date', end);
        
      if (salesError) throw salesError;
      
      // Count sales by seller
      const salesBySellerMap = new Map<string, SellerStats>();
      
      salesData?.forEach(purchase => {
        const sellerId = purchase.seller_id;
        const sellerProfile = purchase.profiles;
        
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <LeaderboardHeader weekStart={weekStart} weekEnd={weekEnd} />
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle className="text-xl">Weekly Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <EmptyLeaderboard message={error} />
            ) : (
              <LeaderboardTable sellers={leaderboard} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellersLeaderboard;
