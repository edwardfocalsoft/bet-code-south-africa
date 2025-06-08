
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@/types";

interface SellerCardProps {
  seller: User & {
    ranking?: number;
    sales_count?: number;
    average_rating?: number;
  };
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  return (
    <Card className="betting-card h-full flex flex-col">
      <CardHeader className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          {seller.avatar_url ? (
            <img
              src={seller.avatar_url}
              alt={seller.username || "Seller"}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-betting-green/20 flex items-center justify-center">
              <Users className="h-8 w-8 text-betting-green" />
            </div>
          )}
          
          {seller.ranking && seller.ranking <= 3 && (
            <div className="absolute -top-1 -right-1">
              <Trophy className={`h-6 w-6 ${
                seller.ranking === 1 ? 'text-yellow-500' :
                seller.ranking === 2 ? 'text-gray-400' :
                'text-amber-600'
              }`} />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-semibold text-lg">{seller.username || "Anonymous"}</h3>
            {seller.verified && (
              <ShieldCheck className="h-5 w-5 text-blue-500" title="Verified Seller" />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {seller.ranking && (
              <Badge variant="outline" className="text-betting-green border-betting-green">
                #{seller.ranking}
              </Badge>
            )}
            
            {seller.average_rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{seller.average_rating?.toFixed(1) || '0.0'}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-betting-green">
              {seller.sales_count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-betting-green hover:bg-betting-green-dark" 
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
