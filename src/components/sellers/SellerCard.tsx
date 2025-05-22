
import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";

interface SellerCardProps {
  seller: User & {
    ranking: number;
    sales_count?: number;
    average_rating?: number;
  };
  featured?: boolean;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, featured = false }) => {
  const { username, ranking, avatar_url, sales_count, average_rating } = seller;
  
  // Format the ranking with the appropriate suffix
  const formatRanking = (rank: number) => {
    if (rank % 10 === 1 && rank % 100 !== 11) return `${rank}st`;
    if (rank % 10 === 2 && rank % 100 !== 12) return `${rank}nd`;
    if (rank % 10 === 3 && rank % 100 !== 13) return `${rank}rd`;
    return `${rank}th`;
  };

  return (
    <Link to={`/sellers/${seller.id}`}>
      <Card className={`border border-betting-light-gray bg-betting-dark-gray hover:border-betting-green transition-colors cursor-pointer h-full ${featured ? 'shadow-lg border-betting-green' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {avatar_url ? (
                  <AvatarImage src={avatar_url} alt={username} />
                ) : (
                  <AvatarFallback className="bg-betting-dark-gray text-betting-green uppercase">
                    {username?.substring(0, 2) || "PP"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{username}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Rank: {formatRanking(ranking)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Badge variant="outline" className="flex justify-center gap-1 items-center py-2">
              <span className="text-betting-green font-semibold">{sales_count || 0}</span>
              <span className="text-xs">Sales</span>
            </Badge>
            
            <Badge variant="outline" className="flex justify-center gap-1 items-center py-2">
              {average_rating ? (
                <>
                  <span className="text-betting-green font-semibold">{average_rating.toFixed(1)}</span>
                  <Star className="h-3 w-3 fill-betting-green text-betting-green" />
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">No ratings</span>
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SellerCard;
