
import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Star, Calendar } from "lucide-react";
import SubscribeButton from "@/components/sellers/SubscribeButton";

const SellerPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState("tickets");
  
  // Mock data for the seller profile
  const seller = {
    id: id || "unknown",
    username: "PremiumTipster",
    avatarUrl: null,
    joinDate: "June 2023",
    winRate: 78,
    ticketsSold: 156,
    rating: 4.8,
    followers: 42,
    bio: "Professional football analyst with over 10 years of experience. Specialized in Premier League and Champions League predictions.",
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Card className="betting-card sticky top-20">
              <CardHeader className="border-b border-betting-light-gray pb-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-betting-light-gray/30 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-betting-green" />
                  </div>
                  <h1 className="text-2xl font-bold mb-1">{seller.username}</h1>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#eab308" />
                    <span>{seller.rating} Rating</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Member since {seller.joinDate}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{seller.winRate}%</p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{seller.ticketsSold}</p>
                    <p className="text-xs text-muted-foreground">Tickets Sold</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{seller.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">93%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
                
                {seller.bio && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{seller.bio}</p>
                  </div>
                )}
                
                <SubscribeButton sellerId={seller.id} variant="default" />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="tickets" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-betting-black mb-8">
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tickets" className="betting-card p-6">
                <h2 className="text-xl font-bold mb-4">{seller.username}'s Tickets</h2>
                <p className="text-muted-foreground text-center py-12">
                  Coming soon: Browse all tickets from this seller.
                </p>
              </TabsContent>
              
              <TabsContent value="reviews" className="betting-card p-6">
                <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
                <p className="text-muted-foreground text-center py-12">
                  Coming soon: Customer reviews and ratings for this seller.
                </p>
              </TabsContent>
              
              <TabsContent value="stats" className="betting-card p-6">
                <h2 className="text-xl font-bold mb-4">Performance Stats</h2>
                <p className="text-muted-foreground text-center py-12">
                  Coming soon: Detailed performance statistics for this seller.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerPublicProfile;
