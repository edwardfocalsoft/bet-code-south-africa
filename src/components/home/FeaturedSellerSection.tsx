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

const FeaturedSellerSection: React.FC = () => {
  const [featuredSeller, setFeaturedSeller] = useState<TopSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchTopSeller = async () => {
      setLoading(true);
      try {
        // Use a simplified 7-day lookback for consistency with the leaderboard
        const now = new Date();
        
        // End date (now)
        const endDate = new Date(now);
        endDate.setUTCHours(23, 59, 59, 999); // End of day in UTC
        
        // Start date (7 days ago)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Go back 7 days
        startDate.setUTCHours(0, 0, 0, 0); // Beginning of day in UTC
        
        console.log(`Fetching top seller for week: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Call the SQL function to get the top seller
        const { data: weekTopSellers, error: weekError } = await supabase.rpc(
          'get_seller_leaderboard', 
          { 
            start_date: startDate.toISOString(), 
            end_date: endDate.toISOString() 
          }
        );
          
        if (weekError) {
          console.error("Error fetching week top seller:", weekError);
          throw weekError;
        }
        
        console.log("Week top seller data:", weekTopSellers);
        
        // If no sales this week, try last month
        if (!weekTopSellers || weekTopSellers.length === 0) {
          console.log("No top seller this week, trying last month");
          setDataSource('month');
          
          // Get sales from the last month with simplified approach
          const monthEndDate = new Date(now);
          monthEndDate.setUTCHours(23, 59, 59, 999); // End of day in UTC
          
          const monthStartDate = new Date(now);
          monthStartDate.setDate(monthStartDate.getDate() - 30); // Go back 30 days
          monthStartDate.setUTCHours(0, 0, 0, 0); // Beginning of day in UTC
          
          console.log(`Fetching top seller for month: ${monthStartDate.toISOString()} to ${monthEndDate.toISOString()}`);
          
          const { data: monthTopSellers, error: monthError } = await supabase.rpc(
            'get_seller_leaderboard', 
            { 
              start_date: monthStartDate.toISOString(), 
              end_date: monthEndDate.toISOString() 
            }
          );
            
          if (monthError) {
            console.error("Error fetching month top seller:", monthError);
            throw monthError;
          }
          
          console.log("Month top seller data:", monthTopSellers);
          
          if (!monthTopSellers || monthTopSellers.length === 0) {
            console.log("No top seller in the last month either");
            setLoading(false);
            return;
          }
          
          // Process month top seller
          const topSeller = monthTopSellers[0];
          setFeaturedSeller(topSeller);
        } else {
          // Process week top seller
          const topSeller = weekTopSellers[0];
          setDataSource('week');
          setFeaturedSeller(topSeller);
        }
      } catch (error: any) {
        console.error("Error fetching featured seller:", error);
        toast.error("Error loading featured seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchTopSeller();
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">
          {dataSource === 'week' 
            ? 'Featured Seller of the Week' 
            : 'Featured Seller of the Month'}
        </h2>
        
        {loading ? (
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
        ) : featuredSeller ? (
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
                      Top performer with {featuredSeller.sales_count} sales 
                      {dataSource === 'week' ? ' this week' : ' this month'}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured seller data available at the moment.</p>
            <Link to="/sellers/leaderboard" className="mt-6 inline-block">
              <Button className="bg-betting-green hover:bg-betting-green-dark text-white">
                View Seller Leaderboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSellerSection;
