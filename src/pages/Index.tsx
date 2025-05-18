
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import BettingSitesSection from "@/components/home/BettingSitesSection";
import FeaturedTicketsSection from "@/components/home/FeaturedTicketsSection";
import TopSellersSection from "@/components/home/TopSellersSection";
import FeaturedSellerSection from "@/components/home/FeaturedSellerSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CTASection from "@/components/home/CTASection";
import { useTickets } from "@/hooks/useTickets";
import { useSellers } from "@/hooks/useSellers";

const Index: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { tickets: allTickets, loading: ticketsLoading } = useTickets();
  const { sellers: allSellers, loading: sellersLoading } = useSellers();
  
  // Filter for featured tickets (non-expired tickets, limit to 6)
  const featuredTickets = allTickets
    .filter(ticket => !ticket.isExpired)
    .slice(0, 6);
  
  // Filter for top sellers (limit to 3)
  const topSellers = allSellers.slice(0, 3);

  return (
    <Layout isHomePage={true}>
      <HeroSection />
      <BettingSitesSection />
      <FeaturedSellerSection />
      <FeaturedTicketsSection 
        tickets={featuredTickets}
        loading={ticketsLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <TopSellersSection 
        sellers={topSellers}
        loading={sellersLoading}
      />
      <HowItWorksSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
