
import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import LeaderboardHeader from "@/components/sellers/leaderboard/LeaderboardHeader";
import LeaderboardTable from "@/components/sellers/leaderboard/LeaderboardTable";
import EmptyLeaderboard from "@/components/sellers/leaderboard/EmptyLeaderboard";
import LoadingState from "@/components/sellers/leaderboard/LoadingState";
import { SellerStats } from "@/components/sellers/leaderboard/LeaderboardTable";
import { toast } from "sonner";

const SellersLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<SellerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'week' | 'month'>('week');

  // Simplified date calculation function that uses a simple 7-day lookback
  const calculateDateRange = useCallback(() => {
    // Get current date
    const now = new Date();
    console.log("Current date (local):", now.toISOString());
    
    // For week data, use a simple 7-day lookback instead of complicated week calculations
    const endDate = new Date(now);
    endDate.setUTCHours(23, 59, 59, 999); // End of day in UTC
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 7); // Go back 7 days
    startDate.setUTCHours(0, 0, 0, 0); // Beginning of day in UTC
    
    console.log("Simplified date range:");
    console.log("- Start date:", startDate.toISOString());
    console.log("- End date:", endDate.toISOString());
    
    // Set the display dates (these are just for UI display)
    setWeekStart(startDate);
    setWeekEnd(endDate);
    
    return { start: startDate, end: endDate };
  }, []);

  const fetchLeaderboard = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      console.log("Fetching leaderboard data for date range:", startStr, "to", endStr);
      
      // Call the SQL function directly
      const { data, error } = await supabase.rpc('get_seller_leaderboard', {
        start_date: startStr,
        end_date: endStr
      });
      
      if (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
      }
      
      console.log("Leaderboard data retrieved:", data);
      
      if (!data || data.length === 0) {
        // If no sales this week, try looking at the last 30 days
        console.log("No data for current week, trying last 30 days");
        setDataSource('month');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setUTCHours(0, 0, 0, 0); // Beginning of day in UTC
        
        const now = new Date();
        now.setUTCHours(23, 59, 59, 999); // End of day in UTC
        
        console.log("Monthly date range:");
        console.log("- Start date (30 days ago):", thirtyDaysAgo.toISOString());
        console.log("- End date (now):", now.toISOString());
        
        const { data: fallbackData, error: fallbackError } = await supabase.rpc(
          'get_seller_leaderboard',
          { 
            start_date: thirtyDaysAgo.toISOString(),
            end_date: now.toISOString()
          }
        );
        
        if (fallbackError) {
          console.error("Error fetching fallback leaderboard data:", fallbackError);
          throw fallbackError;
        }
        
        console.log("Fallback leaderboard data retrieved:", fallbackData);
        
        if (!fallbackData || fallbackData.length === 0) {
          setError("No sales data found for the current week or last 30 days.");
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        setLeaderboard(fallbackData);
      } else {
        // Process and format the current week data
        setDataSource('week');
        setLeaderboard(data);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching leaderboard data:', error);
      toast.error("Failed to load leaderboard data");
      setError("Failed to load leaderboard data. Please try again later.");
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    const { start, end } = calculateDateRange();
    fetchLeaderboard(start, end);
    toast.success("Refreshing leaderboard data...");
  }, [calculateDateRange, fetchLeaderboard]);

  useEffect(() => {
    const { start, end } = calculateDateRange();
    fetchLeaderboard(start, end);
  }, [calculateDateRange, fetchLeaderboard]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <LeaderboardHeader 
          weekStart={weekStart} 
          weekEnd={weekEnd} 
          dataSource={dataSource}
          onRefresh={handleRefresh}
        />
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle className="text-xl">
              {dataSource === 'week' ? 'Weekly Rankings' : 'Monthly Rankings (Last 30 Days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <EmptyLeaderboard message={error} />
            ) : (
              <LeaderboardTable 
                sellers={leaderboard} 
                dataSource={dataSource}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellersLeaderboard;
