
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@/types";
import VerifiedBadge from "@/components/common/VerifiedBadge";

interface SellerCardProps {
  seller: User & {
    ranking?: number;
    sales_count?: number;
    average_rating?: number;
  };
  featured?: boolean;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, featured = false }) => {
  const getRankingBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-yellow-900 border-yellow-600';
      case 2: return 'bg-gray-400 text-gray-900 border-gray-500';
      case 3: return 'bg-amber-600 text-amber-100 border-amber-700';
      default: return 'bg-betting-green text-white border-betting-green';
    }
  };

  return (
    <Card className={`betting-card h-full flex flex-col transition-all duration-300 hover:scale-105 ${featured ? 'border-betting-green shadow-lg' : ''}`}>
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto w-20 h-20 mb-4">
          {seller.avatar_url ? (
            <img
              src={seller.avatar_url}
              alt={seller.username || "Seller"}
              className="w-20 h-20 rounded-full object-cover border-2 border-betting-light-gray"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-betting-green/20 flex items-center justify-center border-2 border-betting-light-gray">
              <Users className="h-10 w-10 text-betting-green" />
            </div>
          )}
          
          {seller.ranking && seller.ranking <= 3 && (
            <div className="absolute -top-2 -right-2">
              <Trophy className={`h-7 w-7 ${
                seller.ranking === 1 ? 'text-yellow-500' :
                seller.ranking === 2 ? 'text-gray-400' :
                'text-amber-600'
              }`} />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-bold text-xl text-white">{seller.username || "Anonymous"}</h3>
            <VerifiedBadge verified={seller.verified} size="md" />
          </div>
          
          <div className="flex items-center justify-center gap-3">
            {seller.ranking && (
              <Badge 
                className={`text-sm font-bold px-3 py-1 ${getRankingBadgeColor(seller.ranking)}`}
              >
                #{seller.ranking}
              </Badge>
            )}
            
            {seller.average_rating !== undefined && seller.average_rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm">
                  {seller.average_rating?.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 px-6 pb-4">
        <div className="text-center space-y-2">
          <div className="bg-betting-green/10 rounded-lg p-4">
            <p className="text-3xl font-bold text-betting-green mb-1">
              {seller.sales_count || 0}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Tickets Sold
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 px-6 pb-6 flex justify-center">
        <Button 
          className="w-full bg-betting-green hover:bg-betting-green-dark text-white font-semibold py-2 transition-colors" 
          asChild
        >
          <Link to={`/sellers/${seller.id}`}>
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SellerCard;
