
import React from "react";
import { Link } from "react-router-dom";
import { User } from "@/types";
import { mockSellerStats } from "@/data/mockData";
import { Award, Star, Check, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerCardProps {
  seller: User;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const stats = mockSellerStats[seller.id];
  
  if (!stats || !seller.username) return null;
  
  const getWinRateColor = (rate: number) => {
    if (rate >= 0.7) return "text-betting-green";
    if (rate >= 0.5) return "text-betting-accent";
    return "text-destructive";
  };
  
  const getRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3 w-3",
              star <= rating ? "text-betting-accent fill-betting-accent" : "text-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="betting-card flex flex-col">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-betting-light-gray flex items-center justify-center mr-3">
          <CircleUser className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{seller.username}</h3>
          <div className="flex items-center text-xs">
            {getRatingStars(stats.averageRating)}
            <span className="ml-1 text-muted-foreground">
              ({stats.averageRating.toFixed(1)})
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center mb-4">
        <div className="betting-card py-2">
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className={cn("font-medium", getWinRateColor(stats.winRate))}>
            {Math.round(stats.winRate * 100)}%
          </div>
        </div>
        
        <div className="betting-card py-2">
          <div className="text-xs text-muted-foreground">Total Sales</div>
          <div className="font-medium">{stats.totalSales}</div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Link
          to={`/seller/${seller.id}`}
          className="betting-button-secondary w-full flex justify-center items-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default SellerCard;
