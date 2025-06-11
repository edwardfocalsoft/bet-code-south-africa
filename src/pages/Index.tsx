
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTicketsSection from "@/components/home/FeaturedTicketsSection";
import TopSellersSection from "@/components/home/TopSellersSection";
import FeaturedSellerSection from "@/components/home/FeaturedSellerSection";
import DailyVouchersSection from "@/components/vouchers/DailyVouchersSection";
import BettingSitesSection from "@/components/home/BettingSitesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CTASection from "@/components/home/CTASection";
import { useTickets } from "@/hooks/useTickets";
import { useSellers } from "@/hooks/useSellers";

const Index = () => {
  // Fetch featured tickets with randomization and limit
  const { tickets: featuredTickets, loading: ticketsLoading } = useTickets({
    fetchOnMount: true,
    filterExpired: true,
    role: "buyer",
    randomize: true
  });

  // Fetch top sellers
  const { sellers, loading: sellersLoading } = useSellers();

  // Limit to 5 featured tickets for the homepage
  const limitedTickets = featuredTickets?.slice(0, 5) || [];
  const limitedSellers = sellers?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <DailyVouchersSection />
        <FeaturedTicketsSection 
          tickets={limitedTickets}
          loading={ticketsLoading}
        />
        <Suspense fallback={<div>Loading featured seller...</div>}>
          <FeaturedSellerSection />
        </Suspense>
        <TopSellersSection 
          sellers={limitedSellers}
          loading={sellersLoading}
        />
        <BettingSitesSection />
        <HowItWorksSection />
        <CTASection />
      </div>
    </Layout>
  );
};

export default Index;
