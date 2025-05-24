
import React from "react";
import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
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

  // If this is being used within the TopSellersSection, don't render the outer Card
  const isInTopSellers = featured !== undefined;

  const content = (
    <div className={isInTopSellers ? "" : "p-5"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className={`${featured ? 'h-16 w-16' : 'h-12 w-12'} ring-2 ring-betting-green/20`}>
            {avatar_url ? (
              <AvatarImage src={avatar_url} alt={username} />
            ) : (
              <AvatarFallback className="bg-betting-dark-gray text-betting-green uppercase font-bold text-lg">
                {username?.substring(0, 2) || "PP"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className={`font-semibold ${featured ? 'text-xl' : 'text-lg'}`}>{username}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Rank: {formatRanking(ranking)}</span>
              {featured && (
                <Badge variant="outline" className="ml-2 text-xs bg-betting-green/10 text-betting-green border-betting-green/30">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
        {featured && (
          <div className="text-right">
            <TrendingUp className="h-6 w-6 text-betting-green mb-1" />
            <p className="text-xs text-muted-foreground">Top Performer</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Badge variant="outline" className="flex justify-center gap-1 items-center py-2 bg-betting-dark-gray/50">
          <span className="text-betting-green font-semibold text-lg">{sales_count || 0}</span>
          <span className="text-xs text-muted-foreground">Sales</span>
        </Badge>
        
        <Badge variant="outline" className="flex justify-center gap-1 items-center py-2 bg-betting-dark-gray/50">
          {average_rating && average_rating > 0 ? (
            <>
              <span className="text-betting-green font-semibold text-lg">{average_rating.toFixed(1)}</span>
              <Star className="h-4 w-4 fill-betting-green text-betting-green" />
            </>
          ) : (
            <span className="text-muted-foreground text-sm">No ratings</span>
          )}
        </Badge>
      </div>
    </div>
  );

  // If this is being used in TopSellersSection, return just the content without wrapper
  if (isInTopSellers) {
    return <Link to={`/sellers/${seller.id}`} className="block">{content}</Link>;
  }

  // Original card wrapper for other uses
  return (
    <Link to={`/sellers/${seller.id}`}>
      <Card className="border border-betting-light-gray bg-betting-dark-gray hover:border-betting-green transition-colors cursor-pointer h-full">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    </Link>
  );
};

export default SellerCard;
