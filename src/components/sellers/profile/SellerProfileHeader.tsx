
import React from "react";
import { User, Star, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SubscribeButton from "@/components/sellers/SubscribeButton";
import { formatDistanceToNow } from "date-fns";

interface SellerStats {
  winRate: number;
  ticketsSold: number;
  followersCount: number;
  satisfaction: number;
  averageRating: number;
  totalRatings: number;
  followers: number;  // Ensure this property is included
}

interface SellerProfileHeaderProps {
  seller: any;
  stats: SellerStats;
}

const SellerProfileHeader: React.FC<SellerProfileHeaderProps> = ({ 
  seller, 
  stats 
}) => {
  return (
    <Card className="betting-card sticky top-20">
      <CardHeader className="border-b border-betting-light-gray pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-betting-light-gray/30 flex items-center justify-center mb-4">
            {seller.avatar_url ? (
              <img 
                src={seller.avatar_url} 
                alt={seller.username} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-betting-green" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {seller.username || "Anonymous Seller"}
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#eab308" />
            <span>
              {stats.averageRating > 0 
                ? `${stats.averageRating.toFixed(1)} Rating (${stats.totalRatings} reviews)` 
                : "No ratings yet"}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Member since {
                seller.created_at ? formatDistanceToNow(new Date(seller.created_at), { 
                  addSuffix: true 
                }) : "unknown date"
              }
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div className="bg-betting-light-gray/20 rounded-md p-3">
            <p className="text-lg font-bold">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div className="bg-betting-light-gray/20 rounded-md p-3">
            <p className="text-lg font-bold">{stats.ticketsSold}</p>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </div>
          <div className="bg-betting-light-gray/20 rounded-md p-3">
            <p className="text-lg font-bold">{stats.followers || stats.followersCount || 0}</p>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </div>
          <div className="bg-betting-light-gray/20 rounded-md p-3">
            <p className="text-lg font-bold">{stats.satisfaction}%</p>
            <p className="text-xs text-muted-foreground">Satisfaction</p>
          </div>
        </div>
        
        <SubscribeButton sellerId={seller.id} variant="default" />
      </CardContent>
    </Card>
  );
};

export default SellerProfileHeader;
