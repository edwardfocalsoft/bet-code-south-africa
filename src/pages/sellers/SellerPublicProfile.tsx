
import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useTickets } from "@/hooks/useTickets";
import { LoadingState } from "@/components/purchases/LoadingState";
import { useAuth } from "@/contexts/auth";
import { useSellerProfile } from "@/hooks/sellers/useSellerProfile";
import SellerProfileHeader from "@/components/sellers/profile/SellerProfileHeader";
import SellerTicketsTab from "@/components/sellers/profile/SellerTicketsTab";
import SellerReviewsTab from "@/components/sellers/profile/SellerReviewsTab";
import SellerStatsTab from "@/components/sellers/profile/SellerStatsTab";
import useSellerStats from "@/hooks/sellers/useSellerStats";

const SellerPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("tickets");
  const { currentUser } = useAuth();
  const { loading: profileLoading, seller, reviews } = useSellerProfile(id);
  const { stats, loading: statsLoading } = useSellerStats(id);
  
  // Get seller tickets using the useTickets hook
  const { tickets: sellerTickets, loading: ticketsLoading } = useTickets({
    fetchOnMount: true,
    filterExpired: false,
    role: "buyer"
  });

  // Filter tickets to only show those from this seller
  const filteredTickets = sellerTickets.filter(ticket => ticket.sellerId === id);
  
  // Redirect seller to their own seller dashboard if they try to view their own profile
  if (currentUser?.id === id && currentUser?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  const loading = profileLoading || statsLoading;

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
            <SellerProfileHeader 
              seller={seller} 
              stats={stats || {
                winRate: 0,
                ticketsSold: 0,
                followersCount: 0,
                satisfaction: 0,
                averageRating: 0,
                totalRatings: 0
              }} 
            />
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="tickets" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-betting-black mb-8">
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tickets">
                <SellerTicketsTab 
                  sellerName={seller.username} 
                  tickets={filteredTickets} 
                  loading={ticketsLoading} 
                />
              </TabsContent>
              
              <TabsContent value="reviews">
                <SellerReviewsTab reviews={reviews} />
              </TabsContent>
              
              <TabsContent value="stats">
                <SellerStatsTab stats={stats || {
                  winRate: 0,
                  ticketsSold: 0,
                  followersCount: 0,
                  satisfaction: 0,
                  averageRating: 0,
                  totalRatings: 0
                }} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerPublicProfile;
