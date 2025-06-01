import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection: React.FC = () => {
  const [stats, setStats] = useState({
    activeBettors: 0,
    winRate: 0,
    totalPayout: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log("Fetching hero stats...");
        
        // Count unique active users (both buyers and sellers)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, role")
          .or('role.eq.buyer,role.eq.seller');
          
        if (profilesError) throw profilesError;
        
        console.log("Active profiles data:", profilesData?.length);
        
        // Count unique active users
        const activeBettors = profilesData?.length || 0;
        console.log("Active bettors count:", activeBettors);
        
        // Calculate win rate from purchases
        const { data: winData, error: winError } = await supabase
          .from("purchases")
          .select("is_winner");
          
        if (winError) throw winError;
        
        let winCount = 0;
        let totalWithResult = 0;
        
        if (winData) {
          winData.forEach(item => {
            if (item.is_winner === true || item.is_winner === false) {
              totalWithResult++;
              if (item.is_winner === true) winCount++;
            }
          });
        }
        
        const calculatedWinRate = totalWithResult > 0 
          ? Math.round((winCount / totalWithResult) * 100) 
          : 0;
        
        console.log("Win rate calculation:", { winCount, totalWithResult, calculatedWinRate });
        
        // Calculate total payouts (sum of all purchases)
        const { data: payoutData, error: payoutError } = await supabase
          .from("purchases")
          .select("price")
          .eq("payment_status", "completed"); // Only count completed purchases
          
        if (payoutError) throw payoutError;
        
        const totalPayout = payoutData?.reduce((sum, item) => sum + (parseFloat(String(item.price)) || 0), 0) || 0;
        console.log("Total payout:", totalPayout);
        
        setStats({
          activeBettors: activeBettors,
          winRate: calculatedWinRate,
          totalPayout: totalPayout,
        });
      } catch (error) {
        console.error("Error fetching hero stats:", error);
        // Set fallback data
        setStats({
          activeBettors: 0,
          winRate: 0,
          totalPayout: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black pt-16 pb-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          South Africa's Premier{" "}
          <span className="text-betting-green bg-clip-text text-transparent bg-gradient-to-r from-betting-green to-teal-500">Betting Code</span>{" "}
          Marketplace
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
          Join thousands of smart bettors sharing and selling winning predictions across all major South African betting sites.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
          <Link to="/tickets">
            <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg">
              Browse Tickets
            </Button>
          </Link>
          <Link to="/sellers/leaderboard">
            <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg">
              Weekly Leaderboard
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-betting-green mb-2">
                  {stats.activeBettors > 999 ? `${(stats.activeBettors/1000).toFixed(0)}k+` : `${stats.activeBettors}+`}
                </div>
                <div className="text-sm text-muted-foreground">Active Bettors</div>
              </>
            )}
          </div>
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-betting-green mb-2">{stats.winRate}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </>
            )}
          </div>
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-betting-green mb-2">
                  R{stats.totalPayout > 999999 
                    ? `${(stats.totalPayout/1000000).toFixed(1)}M+` 
                    : `${(stats.totalPayout/1000).toFixed(0)}K+`}
                </div>
                <div className="text-sm text-muted-foreground">Payouts</div>
              </>
            )}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
