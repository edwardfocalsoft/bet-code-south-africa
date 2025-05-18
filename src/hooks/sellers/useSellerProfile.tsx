
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SellerStats {
  winRate: number;
  ticketsSold: number;
  followers: number;
  satisfaction: number;
  averageRating: number;
  totalRatings: number;
}

export const useSellerProfile = (sellerId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    winRate: 0,
    ticketsSold: 0,
    followers: 0,
    satisfaction: 0,
    averageRating: 0,
    totalRatings: 0
  });

  // Fetch reviews for this seller
  const fetchReviews = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          profiles:buyer_id (username, avatar_url)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!sellerId) return;
      
      setLoading(true);
      try {
        // Get the seller's profile
        const { data: sellerData, error: sellerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sellerId)
          .eq("role", "seller")
          .single();
        
        if (sellerError) throw sellerError;
        if (!sellerData) {
          toast("Seller not found");
          return;
        }
        
        setSeller(sellerData);
        
        // Get sales count
        const { count: salesCount, error: salesError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId);
          
        if (salesError) throw salesError;
        
        // Get winning tickets count for win rate
        const { count: winCount, error: winError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId)
          .eq("is_winner", true);
          
        if (winError) throw winError;
        
        // Get followers count
        const { count: followerCount, error: followerError } = await supabase
          .from("subscriptions")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", sellerId);
          
        if (followerError) throw followerError;
        
        // Fetch reviews
        const reviewsData = await fetchReviews(sellerId);
        setReviews(reviewsData);
        
        // Calculate win rate
        const winRate = salesCount && salesCount > 0 && winCount !== null 
          ? Math.round((winCount / salesCount) * 100) 
          : 0;
          
        // Calculate average rating from reviews
        let averageRating = 0;
        let satisfactionPercentage = 0;
        
        if (reviewsData.length > 0) {
          const totalScore = reviewsData.reduce((sum, review) => sum + review.score, 0);
          averageRating = parseFloat((totalScore / reviewsData.length).toFixed(1));
          satisfactionPercentage = Math.round(averageRating * 20); // Convert 5-star rating to percentage
        }
          
        setStats({
          winRate,
          ticketsSold: salesCount || 0,
          followers: followerCount || 0,
          satisfaction: satisfactionPercentage || 0,
          averageRating: averageRating,
          totalRatings: reviewsData.length
        });
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        toast("Failed to load seller profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerProfile();
  }, [sellerId]);

  return {
    loading,
    seller,
    reviews,
    stats
  };
};
