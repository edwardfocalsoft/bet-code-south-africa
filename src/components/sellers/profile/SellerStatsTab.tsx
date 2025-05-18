
import React from "react";
import { Card } from "@/components/ui/card";
import { Star, Award } from "lucide-react";

interface SellerStats {
  winRate: number;
  ticketsSold: number;
  followers: number;
  satisfaction: number;
  averageRating: number;
  totalRatings: number;
}

interface SellerStatsTabProps {
  stats: SellerStats;
}

const SellerStatsTab: React.FC<SellerStatsTabProps> = ({ stats }) => {
  return (
    <div className="betting-card p-6">
      <h2 className="text-xl font-bold mb-4">Performance Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 bg-betting-light-gray/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Win Rate</h3>
            <Award className="h-5 w-5 text-betting-green" />
          </div>
          <div className="w-full bg-betting-light-gray/30 rounded-full h-2.5">
            <div 
              className="bg-betting-green h-2.5 rounded-full" 
              style={{ width: `${stats.winRate}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1">{stats.winRate}%</p>
        </Card>
        
        <Card className="p-4 bg-betting-light-gray/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Customer Satisfaction</h3>
            <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
          </div>
          <div className="w-full bg-betting-light-gray/30 rounded-full h-2.5">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full" 
              style={{ width: `${stats.satisfaction}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1">{stats.satisfaction}%</p>
          <p className="text-xs text-muted-foreground text-right mt-1">
            Based on {stats.totalRatings || 0} ratings
          </p>
        </Card>
        
        <Card className="p-4 bg-betting-light-gray/20">
          <h3 className="font-medium mb-2">Total Tickets Sold</h3>
          <p className="text-3xl font-bold">{stats.ticketsSold}</p>
        </Card>
        
        <Card className="p-4 bg-betting-light-gray/20">
          <h3 className="font-medium mb-2">Subscribers</h3>
          <p className="text-3xl font-bold">{stats.followers}</p>
        </Card>
      </div>
    </div>
  );
};

export default SellerStatsTab;
