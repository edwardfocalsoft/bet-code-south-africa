
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
      
      // Get all purchases for the current week
      const { data: salesData, error: salesError } = await supabase
        .from('purchases')
        .select('seller_id, price, payment_status')
        .gte('purchase_date', startStr)
        .lte('purchase_date', endStr)
        .eq('payment_status', 'completed');
        
      if (salesError) {
        console.error("Error fetching sales data:", salesError);
        throw salesError;
      }
      
      console.log("Sales data retrieved:", salesData?.length || 0, "purchases");
      
      if (!salesData || salesData.length === 0) {
        console.log("No data for current week, trying last 30 days");
        // If no sales this week, try looking at the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: fallbackSalesData, error: fallbackError } = await supabase
          .from('purchases')
          .select('seller_id, price, payment_status')
          .gte('purchase_date', thirtyDaysAgo.toISOString())
          .eq('payment_status', 'completed');
          
        if (fallbackError) throw fallbackError;
        
        console.log("Fallback sales data retrieved:", fallbackSalesData?.length || 0, "purchases");
        
        if (!fallbackSalesData || fallbackSalesData.length === 0) {
          setError("No sales data found for the current week or last 30 days.");
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        // Process fallback sales data
        await processSalesData(fallbackSalesData);
      } else {
        // Process current week sales data
        await processSalesData(salesData);
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
      const salesBySellerMap = new Map<string, number>();
      
      // Count purchases for each seller
      salesData.forEach(purchase => {
        const sellerId = purchase.seller_id;
        
        if (!salesBySellerMap.has(sellerId)) {
          salesBySellerMap.set(sellerId, 0);
        }
        
        salesBySellerMap.set(sellerId, salesBySellerMap.get(sellerId)! + 1);
      });
      
      console.log("Sellers with sales:", salesBySellerMap.size);
      
      if (salesBySellerMap.size === 0) {
        setError("No seller data found for the selected period.");
        setLeaderboard([]);
        setLoading(false);
        return;
      }
      
      // Fetch seller profiles and prepare leaderboard data
      const sellerIds = Array.from(salesBySellerMap.keys());
      
      // Get seller profiles
      const { data: sellerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', sellerIds);
        
      if (profilesError) {
        console.error("Error fetching seller profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Seller profiles retrieved:", sellerProfiles?.length || 0);
      
      // Create a map of seller profiles by ID for easy lookup
      const sellerProfilesMap = new Map();
      sellerProfiles?.forEach(profile => {
        sellerProfilesMap.set(profile.id, profile);
      });
      
      // Create leaderboard data with seller information
      const leaderboardData: SellerStats[] = [];
      
      for (const [sellerId, salesCount] of salesBySellerMap.entries()) {
        const profile = sellerProfilesMap.get(sellerId);
        
        if (profile) {
          leaderboardData.push({
            id: sellerId,
            username: profile.username || 'Unknown',
            avatar_url: profile.avatar_url,
            salesCount,
            averageRating: 0, // Will be updated below
            rank: 0 // Will be set after sorting
          });
        }
      }
      
      // Fetch ratings for each seller
      for (const seller of leaderboardData) {
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('score')
          .eq('seller_id', seller.id);
          
        if (!ratingsError && ratingsData && ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, item) => sum + item.score, 0);
          const average = totalRating / ratingsData.length;
          seller.averageRating = parseFloat(average.toFixed(1));
        }
      }
      
      // Sort by sales count (descending) and assign ranks
      leaderboardData.sort((a, b) => b.salesCount - a.salesCount);
      
      // Assign ranks (1-based)
      leaderboardData.forEach((seller, index) => {
        seller.rank = index + 1;
      });
      
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
