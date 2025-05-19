
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import SellerAvatar from "./featured-seller/SellerAvatar";
import SellerStats from "./featured-seller/SellerStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const FeaturedSellerSection: React.FC = () => {
  const [featuredSeller, setFeaturedSeller] = useState<any | null>(null);
  const [sellerStats, setSellerStats] = useState({
    totalSales: 0,
    winRate: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

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

        // Call the RPC function to get the top seller
        const { data: weekTopSeller, error: weekError } = await supabase.rpc(
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
        
        console.log("Week top seller data:", weekTopSeller);
        
        // If no sales this week, try last month
        if (!weekTopSeller || weekTopSeller.length === 0) {
          console.log("No top seller this week, trying last month");
          
          // Get sales from the last month
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          const { data: monthTopSeller, error: monthError } = await supabase.rpc(
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
          
          console.log("Month top seller data:", monthTopSeller);
          
          if (!monthTopSeller || monthTopSeller.length === 0) {
            console.log("No top seller in the last month either");
            setLoading(false);
            return;
          }
          
          // Process month top seller
          processTopSeller(monthTopSeller[0]);
        } else {
          // Process week top seller
          processTopSeller(weekTopSeller[0]);
        }
      } catch (error: any) {
        console.error("Error fetching featured seller:", error);
        toast.error("Error loading featured seller data");
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to process the top seller
    const processTopSeller = async (seller: any) => {
      if (!seller) {
        console.log("No top seller found");
        return;
      }
      
      const topSeller = {
        id: seller.id,
        username: seller.username || 'Unknown',
        avatar_url: seller.avatar_url,
        salesCount: seller.sales_count
      };
      
      console.log("Top seller found:", topSeller);
      setFeaturedSeller(topSeller);
      
      // Get seller stats
      await fetchSellerStats(seller.id);
    };
    
    // Helper function to fetch seller stats
    const fetchSellerStats = async (sellerId: string) => {
      try {
        // Get total sales
        const { count: totalSales, error: salesError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('payment_status', 'completed');
          
        if (salesError) throw salesError;
        
        // Get winning tickets
        const { count: winningCount, error: winError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('is_winner', true)
          .eq('payment_status', 'completed');
          
        if (winError) throw winError;
        
        // Calculate win rate
        const winRate = totalSales && totalSales > 0 ? 
          Math.round((winningCount || 0) / totalSales * 100) : 0;
        
        // Get average rating
        const { data: ratings, error: ratingError } = await supabase
          .from('ratings')
          .select('score')
          .eq('seller_id', sellerId);
          
        if (ratingError) throw ratingError;
        
        const averageRating = ratings && ratings.length > 0 ? 
          parseFloat((ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length).toFixed(1)) : 0;
        
        setSellerStats({
          totalSales: totalSales || 0,
          winRate,
          averageRating
        });
      } catch (error) {
        console.error("Error fetching seller stats:", error);
      }
    };

    fetchTopSeller();
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Seller of the Week</h2>
        
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
                      Top performer with {featuredSeller.salesCount} sales this week
                    </p>
                    
                    <SellerStats 
                      totalSales={sellerStats.totalSales}
                      winRate={sellerStats.winRate}
                      averageRating={sellerStats.averageRating}
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
