import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Zap, Shield, TrendingUp } from "lucide-react";

const HeroSection: React.FC = () => {
  const [stats, setStats] = useState({
    activeBettors: 0,
    winRate: 0,
    totalPayout: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, role")
          .or('role.eq.buyer,role.eq.seller');
        if (profilesError) throw profilesError;
        const activeBettors = profilesData?.length || 0;

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
        const calculatedWinRate = totalWithResult > 0 ? Math.round(winCount / totalWithResult * 100) : 0;

        const { data: payoutData, error: payoutError } = await supabase
          .from("purchases")
          .select("price")
          .eq("payment_status", "completed");
        if (payoutError) throw payoutError;
        const totalPayout = payoutData?.reduce((sum, item) => sum + (parseFloat(String(item.price)) || 0), 0) || 0;

        setStats({ activeBettors, winRate: calculatedWinRate, totalPayout });
      } catch (error) {
        console.error("Error fetching hero stats:", error);
        setStats({ activeBettors: 0, winRate: 0, totalPayout: 0 });
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Predictions</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          Make{" "}
          <span className="text-betting-green bg-clip-text text-transparent bg-gradient-to-r from-betting-green to-teal-500">
            Smarter Bets
          </span>{" "}
          with the Oracle
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
          South Africa's first AI-powered betting assistant. Get data-driven predictions on goals, corners, BTTS, double chance and more — using live fixture data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
          <Link to="/oracle">
            <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg gap-2 w-full">
              <Brain className="h-5 w-5" /> Try the Oracle
            </Button>
          </Link>
          <Link to="/tickets">
            <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg w-full">
              Browse Bet Codes
            </Button>
          </Link>
        </div>

        {/* Oracle feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border">
            <Zap className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">Auto Pick mode</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">Safe-only filters</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">Live SofaScore data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-betting-green mb-2">15K+</div>
                <div className="text-sm text-muted-foreground">Smart Punters</div>
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
                <div className="text-3xl font-bold text-betting-green mb-2">R75K+</div>
                <div className="text-sm text-muted-foreground">Payouts</div>
              </>
            )}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">AI Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
