
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import BettingSitesSection from "@/components/home/BettingSitesSection";
import FeaturedTicketsSection from "@/components/home/FeaturedTicketsSection";
import TopSellersSection from "@/components/home/TopSellersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CTASection from "@/components/home/CTASection";
import { useTickets } from "@/hooks/useTickets";
import { useSellers } from "@/hooks/useSellers";

const Index: React.FC = () => {
  // Get random active tickets with kickoff times in the future
  const { tickets: featuredTickets, loading: ticketsLoading } = useTickets({
    fetchOnMount: true,
    filterExpired: true,
    role: "buyer",
    randomize: true // Use the new randomize option
  });
  
  // Get top sellers based on total sales (all-time)
  const { sellers: topSellers, loading: sellersLoading } = useSellers({
    fetchOnMount: true,
    limit: 3,
    sortBy: "sales" // Use the sales sort option
  });

  useEffect(() => {
    console.log("Home page - random featured tickets:", featuredTickets);
    console.log("Home page - top sellers by sales:", topSellers);
  }, [featuredTickets, topSellers]);

  return (
    <Layout isHomePage={true}>
      <HeroSection />
      <BettingSitesSection />
      <FeaturedTicketsSection 
        tickets={featuredTickets}
        loading={ticketsLoading}
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
