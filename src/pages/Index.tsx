
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTicketsSection from "@/components/home/FeaturedTicketsSection";
import TopSellersSection from "@/components/home/TopSellersSection";
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
