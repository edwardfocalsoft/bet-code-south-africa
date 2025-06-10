
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

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <DailyVouchersSection />
        <FeaturedTicketsSection />
        <Suspense fallback={<div>Loading featured seller...</div>}>
          <FeaturedSellerSection />
        </Suspense>
        <TopSellersSection />
        <BettingSitesSection />
        <HowItWorksSection />
        <CTASection />
      </div>
    </Layout>
  );
};

export default Index;
