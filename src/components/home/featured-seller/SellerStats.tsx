
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trophy, TrendingUp, Target } from "lucide-react";
import { User } from "@/types";

interface SellerStatsProps {
  seller: User;
}

const SellerStats: React.FC<SellerStatsProps> = ({ seller }) => {
  return (
    <Card className="betting-card">
      <CardContent className="p-6">
        <h4 className="text-xl font-semibold mb-4 text-center">Performance Stats</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-betting-light-gray/5 rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sales</p>
            <p className="text-2xl font-bold">{seller.sales_count || 0}</p>
          </div>
          
          <div className="text-center p-4 bg-betting-light-gray/5 rounded-lg">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Rating</p>
            <p className="text-2xl font-bold">{seller.average_rating?.toFixed(1) || "0.0"}</p>
          </div>
          
          <div className="text-center p-4 bg-betting-light-gray/5 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Rank</p>
            <p className="text-2xl font-bold">#{seller.ranking || "N/A"}</p>
          </div>
          
          <div className="text-center p-4 bg-betting-light-gray/5 rounded-lg">
            <Target className="h-8 w-8 text-betting-green mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-bold text-betting-green">Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerStats;
