
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
import PlayabetsSellerAd from "@/components/layout/PlayabetsSellerAd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SellerPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("tickets");
  const { currentUser } = useAuth();
  const { loading, seller, reviews, stats } = useSellerProfile(id);
  const isMobile = useIsMobile();
  
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

  const tabOptions = [
    { value: "tickets", label: "Tickets" },
    { value: "reviews", label: "Reviews" },
    { value: "stats", label: "Stats" }
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === activeTab)?.label || "Tickets";
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <SellerProfileHeader seller={seller} stats={stats} />
            <PlayabetsSellerAd />
          </div>
          
          <div className="md:col-span-2">
            {isMobile ? (
              <div className="mb-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between bg-betting-dark-gray border-betting-light-gray text-white hover:bg-betting-light-gray"
                    >
                      {currentTabLabel}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-full bg-betting-dark-gray border-betting-light-gray"
                    align="start"
                  >
                    {tabOptions.map((tab) => (
                      <DropdownMenuItem
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className="text-gray-300 hover:text-white hover:bg-betting-light-gray cursor-pointer"
                      >
                        {tab.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="mt-4">
                  {activeTab === "tickets" && (
                    <SellerTicketsTab 
                      sellerName={seller.username} 
                      tickets={filteredTickets} 
                      loading={ticketsLoading} 
                    />
                  )}
                  {activeTab === "reviews" && (
                    <SellerReviewsTab reviews={reviews} />
                  )}
                  {activeTab === "stats" && (
                    <SellerStatsTab stats={stats} />
                  )}
                </div>
              </div>
            ) : (
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
                  <SellerStatsTab stats={stats} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerPublicProfile;
