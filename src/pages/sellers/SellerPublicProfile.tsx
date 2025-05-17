
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Star, Calendar } from "lucide-react";
import SubscribeButton from "@/components/sellers/SubscribeButton";
import { supabase } from "@/integrations/supabase/client";
import { useTickets } from "@/hooks/useTickets";
import TicketsList from "@/components/tickets/TicketsList";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { LoadingState } from "@/components/purchases/LoadingState";

const SellerPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("tickets");
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [stats, setStats] = useState({
    winRate: 0,
    ticketsSold: 0,
    followers: 0,
    satisfaction: 0,
  });
  
  // Get seller tickets using the useTickets hook
  const { tickets: sellerTickets, loading: ticketsLoading } = useTickets({
    fetchOnMount: true,
    filterExpired: true,
    role: "buyer"
  });

  // Filter tickets to only show those from this seller
  const filteredTickets = sellerTickets.filter(ticket => ticket.sellerId === id);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Get the seller's profile
        const { data: sellerData, error: sellerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("role", "seller")
          .single();
        
        if (sellerError) throw sellerError;
        if (!sellerData) {
          toast("Seller not found");
          return;
        }
        
        setSeller(sellerData);
        
        // Get sales count
        const { count: salesCount, error: salesError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", id);
          
        if (salesError) throw salesError;
        
        // Get winning tickets count for win rate
        const { count: winCount, error: winError } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", id)
          .eq("is_winner", true);
          
        if (winError) throw winError;
        
        // Get followers count
        const { count: followerCount, error: followerError } = await supabase
          .from("subscriptions")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", id);
          
        if (followerError) throw followerError;
        
        // Calculate win rate
        const winRate = salesCount && salesCount > 0 && winCount !== null 
          ? Math.round((winCount / salesCount) * 100) 
          : 0;
          
        // For now, we'll use a fixed satisfaction rating
        // This could be calculated from actual ratings in the future
        const satisfaction = 95;
        
        setStats({
          winRate,
          ticketsSold: salesCount || 0,
          followers: followerCount || 0,
          satisfaction,
        });
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        toast("Failed to load seller profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerProfile();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <LoadingState />
        </div>
      </Layout>
    );
  }
  
  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="betting-card p-6">
            <p className="text-center">Seller not found or no longer available.</p>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Card className="betting-card sticky top-20">
              <CardHeader className="border-b border-betting-light-gray pb-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-betting-light-gray/30 flex items-center justify-center mb-4">
                    {seller.avatar_url ? (
                      <img 
                        src={seller.avatar_url} 
                        alt={seller.username} 
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-betting-green" />
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-1">
                    {seller.username || "Anonymous Seller"}
                  </h1>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#eab308" />
                    <span>{stats.winRate}% Win Rate</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Member since {
                        formatDistanceToNow(new Date(seller.created_at), { 
                          addSuffix: true 
                        })
                      }
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{stats.winRate}%</p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{stats.ticketsSold}</p>
                    <p className="text-xs text-muted-foreground">Tickets Sold</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{stats.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="bg-betting-light-gray/20 rounded-md p-3">
                    <p className="text-lg font-bold">{stats.satisfaction}%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
                
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
                <h2 className="text-xl font-bold mb-4">
                  {seller.username || "Seller"}'s Tickets
                </h2>
                
                {ticketsLoading ? (
                  <LoadingState />
                ) : filteredTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No active tickets available from this seller.
                  </p>
                ) : (
                  <TicketsList tickets={filteredTickets} />
                )}
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
