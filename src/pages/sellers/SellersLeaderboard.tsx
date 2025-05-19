
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    // Calculate week start (Monday) and end (Sunday) in UTC
    const calculateWeekDates = () => {
      const now = new Date();
      console.log("Current date (local):", now.toISOString());
      
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      console.log("Current day of week:", day);
      
      // Calculate the date of Monday (start of week)
      // If today is Sunday (0), we need to go back 6 days
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      
      // Set to beginning of day (midnight) in UTC
      monday.setUTCHours(0, 0, 0, 0);
      
      // Add buffer day to ensure we capture all sales
      const bufferStart = new Date(monday);
      bufferStart.setDate(monday.getDate() - 1); // One day earlier
      
      // Calculate the date of Sunday (end of week)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      // Set to end of day in UTC
      sunday.setUTCHours(23, 59, 59, 999);
      
      // Add buffer to ensure we capture all sales
      const bufferEnd = new Date(sunday);
      bufferEnd.setDate(sunday.getDate() + 1); // One day later
      
      console.log("Week start with buffer (UTC):", bufferStart.toISOString());
      console.log("Week end with buffer (UTC):", bufferEnd.toISOString());
      
      setWeekStart(monday); // Keep the actual week dates for display
      setWeekEnd(sunday);
      
      return { start: bufferStart, end: bufferEnd };
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
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <LeaderboardHeader 
          weekStart={weekStart} 
          weekEnd={weekEnd} 
          dataSource={dataSource} 
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
              <LeaderboardTable sellers={leaderboard} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellersLeaderboard;
