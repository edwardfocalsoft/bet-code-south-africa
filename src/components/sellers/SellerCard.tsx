
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/types";
import SubscribeButton from "./SubscribeButton";

interface SellerCardProps {
  seller: UserType;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  return (
    <Card className="betting-card overflow-hidden">
      <CardHeader className="border-b border-betting-light-gray pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-betting-light-gray/30 flex items-center justify-center">
            <User className="h-6 w-6 text-betting-green" />
          </div>
          <div>
            <h3 className="text-lg font-medium">
              {seller.username || "Anonymous"}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-3 w-3 text-yellow-500 mr-1" fill="#eab308" />
              <span>4.8 Rating</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
          <div>
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-medium">78%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tickets Sold</p>
            <p className="font-medium">156</p>
          </div>
          <div>
            <p className="text-muted-foreground">Member Since</p>
            <p className="font-medium">June 2023</p>
          </div>
          <div>
            <p className="text-muted-foreground">Followers</p>
            <p className="font-medium">42</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link to={`/sellers/${seller.id}`}>View Profile</Link>
          </Button>
          <SubscribeButton sellerId={seller.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerCard;
