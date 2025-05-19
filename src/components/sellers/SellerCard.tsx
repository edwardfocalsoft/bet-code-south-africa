
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Star, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/types";
import SubscribeButton from "./SubscribeButton";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerCardProps {
  seller: UserType & { ranking?: number };
}

interface SellerRealStats {
  winRate: number;
  ticketsSold: number;
  followers: number;
  averageRating: number;
  memberSince: string;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const [stats, setStats] = useState<SellerRealStats>({
    winRate: 0,
    ticketsSold: 0,
    followers: 0,
    averageRating: 0,
    memberSince: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerStats = async () => {
      setLoading(true);
      try {
        // Get total sales
        const { count: totalSales, error: salesError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", seller.id);
          
        if (salesError) throw salesError;
        
        // Get winning tickets for win rate
        const { count: winCount, error: winError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", seller.id)
          .eq("is_winner", true);
          
        if (winError) throw winError;
        
        // Get followers count
        const { count: followerCount, error: followerError } = await supabase
          .from("subscriptions")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", seller.id);
          
        if (followerError) throw followerError;
        
        // Get average rating
        const { data: ratings, error: ratingError } = await supabase
          .from("ratings")
          .select("score")
          .eq("seller_id", seller.id);
          
        if (ratingError) throw ratingError;

        // Calculate stats
        const winRate = totalSales && totalSales > 0 ? 
          Math.round((winCount || 0) / totalSales * 100) : 0;
          
        const averageRating = ratings && ratings.length > 0 ? 
          parseFloat((ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length).toFixed(1)) : 0;
        
        // Format member since date
        const memberSinceDate = seller.createdAt ? format(new Date(seller.createdAt), 'MMM yyyy') : 'Unknown';
        
        setStats({
          winRate,
          ticketsSold: totalSales || 0,
          followers: followerCount || 0,
          averageRating,
          memberSince: memberSinceDate
        });
      } catch (error) {
        console.error("Error fetching seller stats:", error);
        // Set default values in case of error
        setStats({
          winRate: 0,
          ticketsSold: 0,
          followers: 0,
          averageRating: 0,
          memberSince: seller.createdAt ? format(new Date(seller.createdAt), 'MMM yyyy') : 'Unknown'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerStats();
  }, [seller.id, seller.createdAt]);

  return (
    <Card className="betting-card overflow-hidden">
      <CardHeader className="border-b border-betting-light-gray pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-betting-light-gray/30">
              {seller.avatar_url ? (
                <AvatarImage 
                  src={seller.avatar_url} 
                  alt={seller.username} 
                />
              ) : (
                <AvatarFallback>
                  <User className="h-4 w-4 text-betting-green" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-base font-medium">
                {seller.username || "Anonymous"}
              </h3>
              <div className="flex items-center text-sm">
                <Star className="h-3 w-3 text-yellow-500 mr-1" fill="#eab308" />
                <span>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'} Rating</span>
              </div>
            </div>
          </div>
          {seller.ranking && seller.ranking <= 3 && (
            <div className="flex items-center justify-center rounded-full bg-yellow-500 w-6 h-6">
              <span className="text-xs font-bold text-black">#{seller.ranking}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-betting-green" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Win Rate</p>
                <p className="font-medium">{stats.winRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tickets Sold</p>
                <p className="font-medium">{stats.ticketsSold}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">{stats.memberSince}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="font-medium">{stats.followers}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to={`/sellers/${seller.id}`}>View Profile</Link>
              </Button>
              <SubscribeButton sellerId={seller.id} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerCard;
