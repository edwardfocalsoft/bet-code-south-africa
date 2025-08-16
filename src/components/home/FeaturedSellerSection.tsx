
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
  total_sales: number;
}

const FeaturedSellerSection: React.FC = () => {
  const [featuredSeller, setFeaturedSeller] = useState<TopSeller | null>(null);
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
        
        console.log(`Fetching top tipster for week: ${monday.toISOString()} to ${sunday.toISOString()}`);

        // Get sellers with sales data including free tickets
        const { data: sellersWithStats, error: sellersError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            verified
          `)
          .eq('role', 'seller')
          .eq('approved', true)
          .eq('suspended', false);

        if (sellersError) throw sellersError;

        // Get sales data for each seller including free tickets
        const sellersWithSalesData = await Promise.all(
          sellersWithStats.map(async (seller) => {
            // Count all purchases (including free tickets) within the date range
            const { count: salesCount } = await supabase
              .from('purchases')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', seller.id)
              .eq('payment_status', 'completed')
              .gte('purchase_date', monday.toISOString())
              .lte('purchase_date', sunday.toISOString());

            // Get total sales value (excluding free tickets for monetary calculations)
            const { data: salesData } = await supabase
              .from('purchases')
              .select('price')
              .eq('seller_id', seller.id)
              .eq('payment_status', 'completed')
              .gte('purchase_date', monday.toISOString())
              .lte('purchase_date', sunday.toISOString());

            // Get average rating
            const { data: ratingsData } = await supabase
              .from('ratings')
              .select('score')
              .eq('seller_id', seller.id);

            const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
            const averageRating = ratingsData?.length 
              ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / ratingsData.length 
              : 0;

            return {
              id: seller.id,
              username: seller.username,
              avatar_url: seller.avatar_url,
              sales_count: salesCount || 0,
              total_sales: totalSales,
              average_rating: Number(averageRating.toFixed(1)),
              rank: 0 // Will be assigned after sorting
            };
          })
        );

        // Filter out sellers with no sales and sort by sales count (including free tickets)
        const sellersWithSales = sellersWithSalesData
          .filter(seller => seller.sales_count > 0)
          .sort((a, b) => b.sales_count - a.sales_count)
          .map((seller, index) => ({ ...seller, rank: index + 1 }));

        console.log("Week top tipster data:", sellersWithSales);
        
        // If no sales this week, try last month
        if (!sellersWithSales || sellersWithSales.length === 0) {
          console.log("No top tipster this week, trying last month");
          
          // Get sales from the last month
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          const monthSellersWithSalesData = await Promise.all(
            sellersWithStats.map(async (seller) => {
              // Count all purchases (including free tickets) for the last month
              const { count: salesCount } = await supabase
                .from('purchases')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', seller.id)
                .eq('payment_status', 'completed')
                .gte('purchase_date', lastMonth.toISOString())
                .lte('purchase_date', new Date().toISOString());

              // Get total sales value
              const { data: salesData } = await supabase
                .from('purchases')
                .select('price')
                .eq('seller_id', seller.id)
                .eq('payment_status', 'completed')
                .gte('purchase_date', lastMonth.toISOString())
                .lte('purchase_date', new Date().toISOString());

              // Get average rating
              const { data: ratingsData } = await supabase
                .from('ratings')
                .select('score')
                .eq('seller_id', seller.id);

              const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
              const averageRating = ratingsData?.length 
                ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / ratingsData.length 
                : 0;

              return {
                id: seller.id,
                username: seller.username,
                avatar_url: seller.avatar_url,
                sales_count: salesCount || 0,
                total_sales: totalSales,
                average_rating: Number(averageRating.toFixed(1)),
                rank: 0
              };
            })
          );

          const monthSellersWithSales = monthSellersWithSalesData
            .filter(seller => seller.sales_count > 0)
            .sort((a, b) => b.sales_count - a.sales_count)
            .map((seller, index) => ({ ...seller, rank: index + 1 }));
          
          console.log("Month top tipster data:", monthSellersWithSales);
          
          if (!monthSellersWithSales || monthSellersWithSales.length === 0) {
            console.log("No top tipster in the last month either");
            setLoading(false);
            return;
          }
          
          // Process month top seller
          const topSeller = monthSellersWithSales[0];
          setFeaturedSeller(topSeller);
        } else {
          // Process week top seller
          const topSeller = sellersWithSales[0];
          setFeaturedSeller(topSeller);
        }
      } catch (error: any) {
        console.error("Error fetching featured tipster:", error);
        toast.error("Error loading featured tipster data");
      } finally {
        setLoading(false);
      }
    };

    fetchTopSeller();
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Tipster of the Week</h2>
        
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
                      Top performer with {featuredSeller.sales_count} tickets sold this week (including free tickets)
                    </p>
                    
                    <SellerStats 
                      totalSales={featuredSeller.sales_count}
                      winRate={0} // Not provided by the function currently
                      averageRating={featuredSeller.average_rating}
                    />
                    
                    <Link to={`/sellers/${featuredSeller.id}`}>
                      <Button className="mt-6 bg-betting-green hover:bg-betting-green-dark text-white w-full">
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
            <p className="text-muted-foreground">No featured tipster data available at the moment.</p>
            <Link to="/sellers/leaderboard" className="mt-6 inline-block">
              <Button className="bg-betting-green hover:bg-betting-green-dark text-white">
                View Tipster Leaderboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSellerSection;
