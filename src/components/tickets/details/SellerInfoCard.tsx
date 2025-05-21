
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import TipButton from "@/components/sellers/TipButton";
import { useAuth } from "@/contexts/auth";

interface SellerInfoCardProps {
  seller: any;
  ticket: any;
}

const SellerInfoCard: React.FC<SellerInfoCardProps> = ({ seller, ticket }) => {
  const { currentUser } = useAuth();
  const isSeller = currentUser?.id === ticket.seller_id;
  
  if (!seller) {
    return (
      <Card className="betting-card mb-6">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="betting-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Ticket Seller</CardTitle>
        <CardDescription>Provided by</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-12 w-12 border border-betting-light-gray">
            <AvatarImage src={seller.avatar_url} alt={seller.username} />
            <AvatarFallback className="bg-betting-green text-betting-dark-gray">
              {seller.username ? seller.username.substring(0, 2).toUpperCase() : "BC"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{seller.username || "Anonymous"}</div>
            {seller.created_at && (
              <div className="text-xs text-muted-foreground">
                Member since {format(new Date(seller.created_at), "MMM yyyy")}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Link to={`/sellers/${seller.id}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-betting-dark-gray transition-colors">
              View Profile
            </Badge>
          </Link>
        </div>
        
        {!isSeller && currentUser && (
          <TipButton 
            sellerId={seller.id}
            sellerName={seller.username || "Seller"}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SellerInfoCard;
