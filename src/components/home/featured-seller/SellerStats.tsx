
import React from 'react';
import { TrendingUp, Star, TicketIcon } from 'lucide-react';

interface SellerStatsProps {
  winRate: number;
  totalSales: number;
  averageRating?: number;
}

const SellerStats: React.FC<SellerStatsProps> = ({ 
  winRate, 
  totalSales,
  averageRating = 0
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="text-2xl font-bold text-betting-green">{winRate}%</div>
        <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
      </div>
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="text-2xl font-bold text-betting-green">{totalSales}</div>
        <div className="text-xs text-muted-foreground mt-1">Total Sales</div>
      </div>
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="flex items-center justify-center">
          {averageRating > 0 ? (
            <div className="text-2xl font-bold text-betting-green flex items-center">
              {averageRating.toFixed(1)} <Star className="h-4 w-4 ml-1" />
            </div>
          ) : (
            <TrendingUp className="h-6 w-6 text-betting-green" />
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {averageRating > 0 ? "Rating" : "Trending"}
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
