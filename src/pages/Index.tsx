
import { Suspense } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTicketsSection from "@/components/home/FeaturedTicketsSection";
import TopSellersSection from "@/components/home/TopSellersSection";
import BettingSitesSection from "@/components/home/BettingSitesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CTASection from "@/components/home/CTASection";
import { useTickets } from "@/hooks/useTickets";
import { useSellers } from "@/hooks/useSellers";
import { Brain, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        
        {/* Playabets Ad Banner */}
        <div className="py-8 px-4 bg-betting-dark-gray">
          <div className="container mx-auto text-center">
            <a href="https://playabets.click/o/WLL41K?r_id=334&lpage=4xHcpu">
              <img 
                src="https://raven1-playabets-uploads-bucket.s3.eu-west-1.amazonaws.com/campaign-public/resources/banner/images/img_334.gif" 
                id="amp-res-raven-334-1752392284282"
                alt="Playabets Advertisement"
                className="mx-auto max-w-full h-auto"
              />
            </a>
          </div>
        </div>
        
        <FeaturedTicketsSection 
          tickets={limitedTickets}
          loading={ticketsLoading}
        />

        {/* Oracle Promotion Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-y border-border">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet the <span className="text-primary">Oracle</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered football predictions using real-time fixture data. Get smart predictions with filters for goals, corners, BTTS, double chance, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Zap className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Auto Pick</h3>
                <p className="text-sm text-muted-foreground">Let AI pick the safest bets for you automatically</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Safe Mode</h3>
                <p className="text-sm text-muted-foreground">Filter for high-confidence predictions only</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Smart Filters</h3>
                <p className="text-sm text-muted-foreground">Goals, corners, BTTS, double chance & more</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/oracle">
                <Button size="lg" className="gap-2 px-8">
                  <Brain className="h-5 w-5" /> Try the Oracle — R5 per search
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">Punters earn 1 BC point per search!</p>
            </div>
          </div>
        </section>

        <TopSellersSection 
          sellers={limitedSellers}
          loading={sellersLoading}
        />
        <BettingSitesSection />
        <HowItWorksSection />
        <CTASection />
      </div>
      
      {/* Playabets Tracking Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(v){
              var r=v.document;
              var n="https://playabets.click/i/WLL41K?r_id=334";
              var e="#amp-res-raven-334-1752392284282";
              var t=r.querySelector(e);
              var i=function(e){
                var r=e.offsetTop;
                var n=r+e.clientHeight;
                var t=v.scrollY;
                var i=t+v.innerHeight;
                return n>t&&r<i
              };
              var o=function(){
                if(i(t)){
                  var e=r.createElement("iframe");
                  e.style.display="none";
                  e.src=n;
                  r.body.appendChild(e);
                  v.removeEventListener("touchmove",o);
                  v.removeEventListener("resize",o);
                  v.removeEventListener("scroll",o)
                }
              };
              if(t){
                v.addEventListener("touchmove",o);
                v.addEventListener("resize",o);
                v.addEventListener("scroll",o);
                o()
              }
            })(window);
          `
        }}
      />
    </Layout>
  );
};

export default Index;
