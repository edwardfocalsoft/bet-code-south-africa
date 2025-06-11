
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
  const { tickets, loading: ticketsLoading } = useTickets({ 
    fetchOnMount: true, 
    limit: 10,
    filters: { isFeatured: true }
  });

  const { sellers, loading: sellersLoading } = useSellers({
    fetchOnMount: true,
    limit: 3,
    sortBy: "sales"
  });

  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <DailyVouchersSection />
        <FeaturedTicketsSection tickets={tickets} loading={ticketsLoading} />
        <Suspense fallback={<div>Loading featured seller...</div>}>
          <FeaturedSellerSection />
        </Suspense>
        <TopSellersSection sellers={sellers} loading={sellersLoading} />
        <BettingSitesSection />
        <HowItWorksSection />
        <CTASection />
      </div>
    </Layout>
  );
};

export default Index;
