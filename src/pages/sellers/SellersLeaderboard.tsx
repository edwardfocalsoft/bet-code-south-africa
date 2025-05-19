import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import SellerAvatar from "./featured-seller/SellerAvatar";
import SellerStats from "./featured-seller/SellerStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TopSeller {
  id: string;
  username: string;
  avatar_url: string | null;
  rank: number;
  sales_count: number;
  average_rating: number;
}

const getWeekRange = (date: Date = new Date()) => {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

const fetchTopSeller = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_seller_leaderboard', { 
    start_date: startDate.toISOString(), 
    end_date: endDate.toISOString(),
    result_limit: 1 // We only need the top seller
  });

  if (error) {
    throw error;
  }

  return data?.[0] || null;
};

const FeaturedSellerSection: React.FC = () => {
  const [featuredSeller, setFeaturedSeller] = useState<TopSeller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedSeller = async () => {
      setLoading(true);
      try {
        // Try current week first
        const { start: weekStart, end: weekEnd } = getWeekRange();
        let topSeller = await fetchTopSeller(weekStart, weekEnd);

        // Fallback to last 30 days if no sales this week
        if (!topSeller) {
          const lastMonth = new Date();
          lastMonth.setDate(lastMonth.getDate() - 30);
          topSeller = await fetchTopSeller(lastMonth, new Date());
        }

        setFeaturedSeller(topSeller);
      } catch (error) {
        console.error("Error fetching featured seller:", error);
        toast.error("Could not load featured seller data");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedSeller();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Seller of the Week</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="betting-card bg-gradient-to-br from-betting-dark-gray to-betting-black border border-betting-light-gray">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[250px_1fr] gap-6">
                  <div className="bg-betting-dark-gray p-6 flex flex-col items-center justify-center">
                    <Skeleton className="w-32 h-32 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                  </div>
                  <div className="p-6">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-4 w-full max-w-md mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <Skeleton className="h-16 rounded-md" />
                      <Skeleton className="h-16 rounded-md" />
                      <Skeleton className="h-16 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredSeller) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Seller of the Week</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured seller data available at the moment.</p>
            <Link to="/sellers/leaderboard" className="mt-6 inline-block">
              <Button className="bg-betting-green hover:bg-betting-green-dark text-white">
                View Seller Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Seller of the Week</h2>
        <div className="max-w-3xl mx-auto">
          <Card className="betting-card bg-gradient-to-br from-betting-dark-gray to-betting-black border border-betting-light-gray">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[250px_1fr] gap-6">
                <SellerAvatar 
                  username={featuredSeller.username} 
                  avatarUrl={featuredSeller.avatar_url}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{featuredSeller.username}</h3>
                  <p className="text-muted-foreground mb-6">
                    {featuredSeller.rank === 1 ? "Top performer": "Featured seller"} with {featuredSeller.sales_count} sales
                  </p>
                  
                  <SellerStats 
                    totalSales={featuredSeller.sales_count}
                    winRate={0} // Not provided by the function currently
                    averageRating={featuredSeller.average_rating}
                  />
                  
                  <Link to={`/sellers/${featuredSeller.id}`}>
                    <Button className="mt-6 bg-betting-green hover:bg-betting-green-dark text-white">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSellerSection;