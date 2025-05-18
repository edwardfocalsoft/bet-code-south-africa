
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
      console.log("Current date:", now.toISOString());
      
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      console.log("Current day of week:", day);
      
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
      
      console.log("Week start (Monday):", monday.toISOString());
      console.log("Week end (Sunday):", sunday.toISOString());
      
      setWeekStart(monday);
      setWeekEnd(sunday);
      
      return { start: monday, end: sunday };
    };
    
    const { start, end } = calculateWeekDates();
    fetchLeaderboard(start, end);
  }, []);

  const fetchLeaderboard = async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      console.log("Fetching leaderboard data for date range:", startStr, "to", endStr);
      
      // First, get all sales for the week with the correct foreign key reference
      const { data: salesData, error: salesError } = await supabase
        .from('purchases')
        .select(`
          seller_id,
          profiles(id, username, avatar_url)
        `)
        .eq('profiles.id', supabase.rpc('auth.uid'))
        .gte('purchase_date', startStr)
        .lte('purchase_date', endStr);
        
      if (salesError) {
        console.error("Error fetching sales data:", salesError);
        throw salesError;
      }
      
      console.log("Sales data retrieved:", salesData?.length || 0, "purchases");
      console.log("Sample sales data:", salesData?.[0]);
      
      // If no data for current week, try last 30 days
      if (!salesData || salesData.length === 0) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        console.log("No data for current week, trying last 30 days from:", thirtyDaysAgo.toISOString());
        
        const { data: fallbackSalesData, error: fallbackError } = await supabase
          .from('purchases')
          .select(`
            seller_id,
            profiles(id, username, avatar_url)
          `)
          .gte('purchase_date', thirtyDaysAgo.toISOString());
          
        if (fallbackError) throw fallbackError;
        
        if (fallbackSalesData && fallbackSalesData.length > 0) {
          processSalesData(fallbackSalesData);
        } else {
          setError("No sales data found for the current week or last 30 days.");
          setLeaderboard([]);
          setLoading(false);
        }
      } else {
        processSalesData(salesData);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard data:', error);
      setError("Failed to load leaderboard data. Please try again later.");
      setLoading(false);
    }
  };
  
  const processSalesData = async (salesData: any[]) => {
    try {
      // Count sales by seller
      const salesBySellerMap = new Map<string, SellerStats>();
      
      salesData.forEach(purchase => {
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
      
      console.log("Final leaderboard data:", leaderboardData);
      
      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error processing sales data:', error);
      setError("Failed to process leaderboard data.");
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
