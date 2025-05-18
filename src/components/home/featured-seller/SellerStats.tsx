
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SellerStatsProps {
  winRate: number;
  totalTickets: number;
}

const SellerStats: React.FC<SellerStatsProps> = ({ winRate, totalTickets }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="text-2xl font-bold text-betting-green">{winRate}%</div>
        <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
      </div>
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="text-2xl font-bold text-betting-green">{totalTickets}</div>
        <div className="text-xs text-muted-foreground mt-1">Total Tickets</div>
      </div>
      <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
        <div className="flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-betting-green" />
        </div>
        <div className="text-xs text-muted-foreground mt-1">Trending</div>
      </div>
    </div>
  );
};

export default SellerStats;
