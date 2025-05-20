
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeaderboardHeader from "@/components/sellers/leaderboard/LeaderboardHeader";
import LeaderboardTable from "@/components/sellers/leaderboard/LeaderboardTable";
import EmptyLeaderboard from "@/components/sellers/leaderboard/EmptyLeaderboard";
import LoadingState from "@/components/sellers/leaderboard/LoadingState";
import { SellerStats } from "@/components/sellers/leaderboard/LeaderboardTable";
import { toast } from "sonner";
import { fetchSellerLeaderboard } from "@/utils/sqlFunctions";

const SellersLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<SellerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set the specific week of May 19-25, 2025
    const getSpecificWeek = () => {
      const start = new Date(2025, 4, 19); // May 19, 2025 (month is 0-indexed)
      const end = new Date(2025, 4, 25, 23, 59, 59, 999); // May 25, 2025, end of day
      
      console.log("Week start:", start.toISOString());
      console.log("Week end:", end.toISOString());
      
      setWeekStart(start);
      setWeekEnd(end);
      
      return { start, end };
    };
    
    const { start, end } = getSpecificWeek();
    fetchLeaderboard(start, end);
  }, []);

  const fetchLeaderboard = async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching leaderboard data for date range:", start.toISOString(), "to", end.toISOString());
      
      // Use our improved function that uses the public leaderboard function
      const data = await fetchSellerLeaderboard(start, end, 20);
      
      if (!data || data.length === 0) {
        // If no sales this week, try looking at the last 30 days
        console.log("No data for specified week, trying last 30 days");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const fallbackData = await fetchSellerLeaderboard(thirtyDaysAgo, new Date(), 20);
        
        if (!fallbackData || fallbackData.length === 0) {
          setError("No sales data found for the current week or last 30 days.");
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        setLeaderboard(fallbackData);
        // Update date range to reflect the 30-day period
        setWeekStart(thirtyDaysAgo);
      } else {
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
            ) : leaderboard.length === 0 ? (
              <EmptyLeaderboard message="No sales data found for the selected time period." />
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
