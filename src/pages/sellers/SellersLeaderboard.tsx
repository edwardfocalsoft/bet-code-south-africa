
import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeaderboardHeader from "@/components/sellers/leaderboard/LeaderboardHeader";
import LeaderboardTable from "@/components/sellers/leaderboard/LeaderboardTable";
import EmptyLeaderboard from "@/components/sellers/leaderboard/EmptyLeaderboard";
import LoadingState from "@/components/sellers/leaderboard/LoadingState";
import { SellerStats } from "@/components/sellers/leaderboard/LeaderboardTable";
import { toast } from "sonner";
import { getSellerLeaderboard } from "@/utils/sqlFunctions";

const SellersLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<SellerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [dataSource] = useState<'week'>('week');

  // Calculate the week start date (Monday) and end date (Sunday)
  const calculateDateRange = useCallback(() => {
    // Create a hardcoded date for May 19, 2025 (Monday)
    const mondayDate = new Date(2025, 4, 19, 0, 0, 0, 0); // May is month 4 (zero-indexed)
    
    // Create a hardcoded date for May 25, 2025 (Sunday)
    const sundayDate = new Date(2025, 4, 25, 23, 59, 59, 999);
    
    console.log("Weekly date range for leaderboard:");
    console.log("- Week start (Monday):", mondayDate.toISOString());
    console.log("- Week end (Sunday):", sundayDate.toISOString());
    
    // Set the display dates
    setWeekStart(mondayDate);
    setWeekEnd(sundayDate);
    
    return { start: mondayDate, end: sundayDate };
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { start, end } = calculateDateRange();
      console.log(`Fetching leaderboard for date range: ${start.toISOString()} to ${end.toISOString()}`);
      
      const data = await getSellerLeaderboard(start, end);
      
      console.log("Leaderboard data retrieved:", data);
      
      if (!data || data.length === 0) {
        console.log("No sales data found for the current week");
        setLeaderboard([]);
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
  }, [calculateDateRange]);

  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    toast.success("Refreshing leaderboard data...");
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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
              Weekly Sales Rankings (Since Monday)
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
