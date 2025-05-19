
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
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

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
      
      if (!data || data.length === 0 || (data.length > 0 && data.every(seller => seller.sales_count === 0))) {
        // If no sales this week or all sellers have 0 sales, try looking at the last 30 days
        console.log("No sales data for current week, trying last 30 days");
        setTimeRange('month');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: fallbackData, error: fallbackError } = await supabase.rpc(
          'get_seller_leaderboard',
          { 
            start_date: thirtyDaysAgo.toISOString(),
            end_date: new Date().toISOString()
          }
        );
        
        if (fallbackError) {
          console.error("Error fetching fallback leaderboard data:", fallbackError);
          throw fallbackError;
        }
        
        console.log("Fallback leaderboard data retrieved:", fallbackData);
        
        if (!fallbackData || fallbackData.length === 0 || fallbackData.every(seller => seller.sales_count === 0)) {
          setError("No sales data found for the current week or last 30 days.");
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        setLeaderboard(fallbackData);
      } else {
        // Process and format the current week data
        setTimeRange('week');
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
          timeRange={timeRange}
        />
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle className="text-xl">
              {timeRange === 'week' ? 'Weekly Rankings' : 'Monthly Rankings'}
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
