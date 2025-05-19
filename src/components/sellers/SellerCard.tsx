
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
import { useSellerStats } from "@/hooks/sellers/useSellerStats";

interface SellerCardProps {
  seller: UserType & { ranking?: number };
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const { stats, loading } = useSellerStats(seller.id);
  
  // Format member since date from seller's createdAt
  const memberSince = React.useMemo(() => {
    if (!seller.createdAt) return "Unknown";
    
    try {
      // Handle both Date object and ISO string formats
      const date = typeof seller.createdAt === 'string' 
        ? new Date(seller.createdAt)
        : seller.createdAt;
      
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error("Error formatting member since date:", error, seller.createdAt);
      return "Unknown";
    }
  }, [seller.createdAt]);

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
                <span>{stats?.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'} Rating</span>
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
                <p className="font-medium">{stats?.winRate || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tickets Sold</p>
                <p className="font-medium">{stats?.ticketsSold || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">{memberSince}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="font-medium">{stats?.followersCount || 0}</p>
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
