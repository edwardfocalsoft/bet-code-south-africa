
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSellerStats } from "@/utils/sqlFunctions";
import SellerAvatar from "./featured-seller/SellerAvatar";
import SellerStats from "./featured-seller/SellerStats";

interface FeaturedSeller {
  id: string;
  username: string;
  winRate: number;
  totalTickets: number;
  rating: number;
  description?: string;
}

const FeaturedSellerSection: React.FC = () => {
  const [featuredSeller, setFeaturedSeller] = useState<FeaturedSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedSeller = async () => {
      try {
        setLoading(true);
        
        // Get the current week's start (Monday) and end (Sunday)
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate the date of Monday (start of week)
        // If today is Sunday (0), we need to go back 6 days
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        
        // Calculate the date of Sunday (end of week)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        // Get purchases for the current week
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .select(`
            seller_id,
            profiles!purchases_seller_id_fkey(username)
          `)
          .gte("purchase_date", monday.toISOString())
          .lte("purchase_date", sunday.toISOString());
          
        if (purchaseError) throw purchaseError;
        
        // Count sales by seller
        const salesCount: Record<string, { count: number; username: string }> = {};
        purchaseData?.forEach(purchase => {
          const sellerId = purchase.seller_id;
          if (!salesCount[sellerId]) {
            salesCount[sellerId] = { 
              count: 0, 
              username: purchase.profiles?.username || "Unknown" 
            };
          }
          salesCount[sellerId].count++;
        });
        
        // Find seller with most sales
        let topSellerId = "";
        let maxSales = 0;
        let topUsername = "";
        
        Object.entries(salesCount).forEach(([sellerId, data]) => {
          if (data.count > maxSales) {
            maxSales = data.count;
            topSellerId = sellerId;
            topUsername = data.username;
          }
        });
        
        // If we found a seller with sales
        if (topSellerId) {
          // Get seller stats
          const stats = await getSellerStats(topSellerId);
          
          if (stats) {
            // Get tickets to create a seller description
            const { data: ticketData, error: ticketError } = await supabase
              .from("tickets")
              .select("betting_site")
              .eq("seller_id", topSellerId)
              .limit(5);
              
            if (ticketError) throw ticketError;
            
            // Generate a unique list of betting sites this seller specializes in
            const bettingSites = [...new Set(ticketData?.map(t => t.betting_site))];
            
            // Create a description based on their stats and betting sites
            const description = `Specialist in ${bettingSites.join(', ')} predictions with a ${stats.winRate}% win rate across ${stats.totalSales} tickets sold.`;
            
            setFeaturedSeller({
              id: topSellerId,
              username: topUsername,
              winRate: stats.winRate,
              totalTickets: stats.totalSales,
              rating: stats.averageRating,
              description
            });
          } else {
            // Fallback with basic info if stats are unavailable
            setFeaturedSeller({
              id: topSellerId,
              username: topUsername,
              winRate: 0,
              totalTickets: maxSales,
              rating: 0,
              description: `Active seller with ${maxSales} recent sales.`
            });
          }
        } else {
          console.log("No featured seller found for this week");
          // No sales this week, try to get the most successful seller from the last month
          await fetchBestSellerLastMonth();
        }
      } catch (error) {
        console.error("Error fetching featured seller:", error);
        toast({
          title: "Error",
          description: "Failed to load featured seller data.",
          variant: "destructive",
        });
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchBestSellerLastMonth = async () => {
      try {
        // Get the last 30 days
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        
        // Get purchases for the last month
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .select(`
            seller_id,
            profiles!purchases_seller_id_fkey(username)
          `)
          .gte("purchase_date", oneMonthAgo.toISOString());
          
        if (purchaseError) throw purchaseError;
        
        // Count sales by seller
        const salesCount: Record<string, { count: number; username: string }> = {};
        purchaseData?.forEach(purchase => {
          const sellerId = purchase.seller_id;
          if (!salesCount[sellerId]) {
            salesCount[sellerId] = { 
              count: 0, 
              username: purchase.profiles?.username || "Unknown" 
            };
          }
          salesCount[sellerId].count++;
        });
        
        // Find seller with most sales
        let topSellerId = "";
        let maxSales = 0;
        let topUsername = "";
        
        Object.entries(salesCount).forEach(([sellerId, data]) => {
          if (data.count > maxSales) {
            maxSales = data.count;
            topSellerId = sellerId;
            topUsername = data.username;
          }
        });
        
        if (topSellerId) {
          const stats = await getSellerStats(topSellerId);
          
          if (stats) {
            setFeaturedSeller({
              id: topSellerId,
              username: topUsername,
              winRate: stats.winRate,
              totalTickets: stats.totalSales,
              rating: stats.averageRating,
              description: `Top performing seller with ${stats.totalSales} tickets sold and a ${stats.winRate}% win rate.`
            });
          } else {
            setFeaturedSeller({
              id: topSellerId,
              username: topUsername,
              winRate: 0,
              totalTickets: maxSales,
              rating: 0,
              description: `Top performing seller with ${maxSales} total sales.`
            });
          }
        } else {
          setFeaturedSeller(null);
        }
      } catch (error) {
        console.error("Error fetching best seller last month:", error);
        setFeaturedSeller(null);
      }
    };

    fetchFeaturedSeller();
  }, [toast]);

  // If loading, show skeleton loading state
  if (loading) {
    return (
      <section className="py-16 px-4 bg-betting-dark-gray">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium flex items-center">
              <Award className="h-6 w-6 mr-2 text-betting-green" />
              Featured Seller of the Week
            </h2>
            <Link to="/sellers/leaderboard" className="text-betting-green hover:underline font-medium">
              View Leaderboard
            </Link>
          </div>
          <Card className="betting-card bg-betting-black border-betting-light-gray overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="p-6 md:border-r border-betting-light-gray animate-pulse">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-betting-dark-gray mb-4"></div>
                    <div className="h-6 w-32 bg-betting-dark-gray rounded mb-2"></div>
                    <div className="h-4 w-16 bg-betting-dark-gray rounded mb-4"></div>
                    <div className="h-9 w-24 bg-betting-dark-gray rounded"></div>
                  </div>
                </div>
                <div className="p-6 md:col-span-2 animate-pulse">
                  <div className="h-6 w-56 bg-betting-dark-gray rounded mb-4"></div>
                  <div className="h-4 w-full bg-betting-dark-gray rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-betting-dark-gray rounded mb-6"></div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-betting-dark-gray rounded-lg"></div>
                    <div className="p-3 bg-betting-dark-gray rounded-lg"></div>
                    <div className="p-3 bg-betting-dark-gray rounded-lg"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!featuredSeller) {
    return null; // No seller found, don't render section
  }

  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium flex items-center">
            <Award className="h-6 w-6 mr-2 text-betting-green" />
            Featured Seller of the Week
          </h2>
          <Link to="/sellers/leaderboard" className="text-betting-green hover:underline font-medium">
            View Leaderboard
          </Link>
        </div>

        <Card className="betting-card bg-betting-black border-betting-light-gray overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-6 md:border-r border-betting-light-gray">
                <div className="flex flex-col items-center text-center">
                  <SellerAvatar username={featuredSeller.username} />
                  <h3 className="text-xl font-bold mb-1">{featuredSeller.username}</h3>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{featuredSeller.rating.toFixed(1)}/5</span>
                  </div>
                  <Link to={`/sellers/${featuredSeller.id}`}>
                    <Button variant="outline" className="text-betting-green border-betting-green hover:bg-betting-green/10">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 md:col-span-2">
                <h4 className="text-lg font-semibold mb-4">Why {featuredSeller.username} is Featured</h4>
                <p className="text-muted-foreground mb-6">
                  {featuredSeller.description || `Top performing seller with a solid track record of successful betting predictions.`}
                </p>
                
                <SellerStats 
                  winRate={featuredSeller.winRate}
                  totalTickets={featuredSeller.totalTickets}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedSellerSection;
