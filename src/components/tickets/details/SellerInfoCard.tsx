
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, User, MessageCircle, ShieldCheck } from "lucide-react";
import TipButton from "@/components/sellers/TipButton";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

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

  const handleWhatsAppClick = () => {
    if (seller.whatsapp_number) {
      const cleanNumber = seller.whatsapp_number.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="font-semibold">{seller.username || "Anonymous"}</span>
              {seller.verified && (
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
            {seller.created_at && (
              <div className="text-xs text-muted-foreground">
                Member since {format(new Date(seller.created_at), "MMM yyyy")}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Link to={`/sellers/${seller.id}`} className="block">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              View Profile
            </Button>
          </Link>
          
          {seller.display_whatsapp && seller.whatsapp_number && !isSeller && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
          
          {!isSeller && currentUser && (
            <TipButton 
              sellerId={seller.id}
              sellerName={seller.username || "Seller"}
              variant="outline"
              size="sm"
              className="w-full"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfoCard;
