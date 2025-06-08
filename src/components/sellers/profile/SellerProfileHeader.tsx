
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Trophy, TrendingUp } from "lucide-react";
import TipButton from "@/components/sellers/TipButton";
import SubscribeButton from "@/components/sellers/SubscribeButton";
import { useAuth } from "@/contexts/auth";

interface SellerProfileHeaderProps {
  seller: any;
  stats: any;
}

const SellerProfileHeader: React.FC<SellerProfileHeaderProps> = ({ seller, stats }) => {
  const { currentUser } = useAuth();
  const isSelf = currentUser?.id === seller.id;
  
  return (
    <Card className="betting-card mb-4">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="flex justify-between">
          <span className="text-xl">Seller Profile</span>
          {stats && (
            <Badge className="bg-betting-green text-white">
              {stats.winRate || 0}% Win Rate
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Ticket Provider</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border border-betting-light-gray">
            <AvatarImage
              src={seller.avatar_url}
              alt={seller.username}
            />
            <AvatarFallback className="text-lg bg-betting-green text-betting-dark-gray">
              {seller.username ? seller.username.substring(0, 2).toUpperCase() : "BC"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-xl mb-1">{seller.username || "Anonymous"}</h3>
            <p className="text-sm text-muted-foreground">
              Member since {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "Unknown"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-2 border-t border-b border-betting-light-gray/20">
          <div className="flex flex-col items-center p-2">
            <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-sm text-muted-foreground">Sales</span>
            <span className="font-bold">{stats?.totalSales || 0}</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-sm text-muted-foreground">Followers</span>
            <span className="font-bold">{stats?.followers || 0}</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <Star className="h-5 w-5 text-yellow-600 mb-1" />
            <span className="text-sm text-muted-foreground">Rating</span>
            <span className="font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <Award className="h-5 w-5 text-betting-green mb-1" />
            <span className="text-sm text-muted-foreground">Satisfaction</span>
            <span className="font-bold">{stats?.satisfaction?.toFixed(0) || 0}%</span>
          </div>
        </div>
        
        {!isSelf && currentUser && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center border-t border-betting-light-gray/20 pt-4">
            <SubscribeButton 
              sellerId={seller.id}
              variant="outline"
            />
            <TipButton 
              sellerId={seller.id}
              sellerName={seller.username || "Seller"}
              variant="outline"
              size="default"
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerProfileHeader;
