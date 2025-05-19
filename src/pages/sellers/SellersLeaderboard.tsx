
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
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      console.log("Fetching leaderboard data for date range:", startStr, "to", endStr);
      
      // Call the updated SQL function with the limit parameter
      const { data, error } = await supabase.rpc('get_seller_leaderboard', {
        start_date: startStr,
        end_date: endStr,
        result_limit: 20 // Show more results to ensure we have enough data
      });
      
      if (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
      }
      
      console.log("Leaderboard data retrieved:", data);
      
      if (!data || data.length === 0) {
        // If no sales this week, try looking at the last 30 days
        console.log("No data for specified week, trying last 30 days");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: fallbackData, error: fallbackError } = await supabase.rpc(
          'get_seller_leaderboard',
          { 
            start_date: thirtyDaysAgo.toISOString(),
            end_date: new Date().toISOString(),
            result_limit: 20
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
        
        // Fetch the total sales amounts for each seller
        const leaderboardWithTotalSales = await fetchTotalSalesForSellers(fallbackData, thirtyDaysAgo, new Date());
        setLeaderboard(leaderboardWithTotalSales);
      } else {
        // Fetch the total sales amounts for each seller
        const leaderboardWithTotalSales = await fetchTotalSalesForSellers(data, start, end);
        setLeaderboard(leaderboardWithTotalSales);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching leaderboard data:', error);
      toast.error("Failed to load leaderboard data");
      setError("Failed to load leaderboard data. Please try again later.");
      setLoading(false);
    }
  };

  // New function to fetch total sales amounts
  const fetchTotalSalesForSellers = async (sellerData: SellerStats[], start: Date, end: Date) => {
    try {
      // For each seller, fetch their total sales amount for the given period
      const enhancedData = await Promise.all(
        sellerData.map(async (seller) => {
          const { data, error } = await supabase
            .from('purchases')
            .select('price')
            .eq('seller_id', seller.id)
            .eq('payment_status', 'completed')
            .gt('price', 0) // Exclude free tickets
            .gte('purchase_date', start.toISOString())
            .lte('purchase_date', end.toISOString());
            
          if (error) {
            console.error(`Error fetching sales for seller ${seller.id}:`, error);
            return { ...seller, total_sales: 0 };
          }
          
          const total = data?.reduce((sum, item) => sum + parseFloat(String(item.price || 0)), 0) || 0;
          return { ...seller, total_sales: total };
        })
      );
      
      return enhancedData;
    } catch (error) {
      console.error('Error fetching total sales:', error);
      // Return the original data if there was an error
      return sellerData;
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
