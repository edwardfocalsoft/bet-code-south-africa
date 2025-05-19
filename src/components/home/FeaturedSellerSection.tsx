
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
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchTopSeller = async () => {
      setLoading(true);
      try {
        // Calculate week dates
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate the date of Monday (start of week)
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        
        // Calculate the date of Sunday (end of week)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        console.log(`Fetching top seller for week: ${monday.toISOString()} to ${sunday.toISOString()}`);

        // Call the SQL function to get the top seller
        const { data: weekTopSellers, error: weekError } = await supabase.rpc(
          'get_seller_leaderboard', 
          { 
            start_date: monday.toISOString(), 
            end_date: sunday.toISOString() 
          }
        );
          
        if (weekError) {
          console.error("Error fetching week top seller:", weekError);
          throw weekError;
        }
        
        console.log("Week top seller data:", weekTopSellers);
        
        // If no sales this week or all sellers have 0 sales, try last month
        if (!weekTopSellers || weekTopSellers.length === 0 || (weekTopSellers.length > 0 && weekTopSellers[0].sales_count === 0)) {
          console.log("No top seller with sales this week, trying last month");
          setTimeRange('month');
          
          // Get sales from the last month
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          const { data: monthTopSellers, error: monthError } = await supabase.rpc(
            'get_seller_leaderboard', 
            { 
              start_date: lastMonth.toISOString(), 
              end_date: new Date().toISOString() 
            }
          );
            
          if (monthError) {
            console.error("Error fetching month top seller:", monthError);
            throw monthError;
          }
          
          console.log("Month top seller data:", monthTopSellers);
          
          if (!monthTopSellers || monthTopSellers.length === 0 || (monthTopSellers.length > 0 && monthTopSellers[0].sales_count === 0)) {
            console.log("No top seller in the last month with sales either");
            setLoading(false);
            return;
          }
          
          // Process month top seller
          const topSeller = monthTopSellers[0];
          setFeaturedSeller(topSeller);
        } else {
          // Process week top seller
          setTimeRange('week');
          const topSeller = weekTopSellers[0];
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
          Featured Seller of the {timeRange === 'week' ? 'Week' : 'Month'}
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
                      {featuredSeller.sales_count > 0 ? (
                        `Top performer with ${featuredSeller.sales_count} ${featuredSeller.sales_count === 1 ? 'sale' : 'sales'} this ${timeRange}`
                      ) : (
                        `Top trending seller this ${timeRange}`
                      )}
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
