
import React from "react";
import { Link } from "react-router-dom";
import { Award, TrendingUp, Trophy } from "lucide-react";
import SellerCard from "@/components/sellers/SellerCard";
import { User } from "@/types";
import { Button } from "@/components/ui/button";

interface TopSellersSectionProps {
  sellers: User[];
  loading: boolean;
}

const TopSellersSection: React.FC<TopSellersSectionProps> = ({
  sellers,
  loading,
}) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="h-10 w-10 mr-4 text-betting-green" />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-betting-green bg-clip-text text-transparent">
              Top Performing Sellers
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our highest-rated sellers who consistently deliver winning predictions and exceptional value to our community.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-betting-green/10 mb-6">
              <TrendingUp className="h-10 w-10 text-betting-green animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground">Loading top performers...</p>
          </div>
        ) : (
          <>
            {sellers && sellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {sellers.map((seller, index) => {
                  const position = index + 1;
                  const isTopThree = position <= 3;
                  
                  return (
                    <div key={seller.id} className="relative">
                      <SellerCard 
                        seller={{
                          ...seller,
                          ranking: seller.ranking || position,
                          sales_count: seller.sales_count || 0
                        }}
                        featured={isTopThree}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-betting-light-gray/10 mb-8">
                  <Award className="h-12 w-12 text-betting-green/50" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No Top Sellers Yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                  Our sellers are working hard to establish their rankings. Check back soon to see our top performers!
                </p>
              </div>
            )}
            
            {/* Call to Action */}
            <div className="text-center">
              <div className="inline-flex gap-6">
                <Link to="/sellers/leaderboard">
                  <Button 
                    size="lg" 
                    className="bg-betting-green hover:bg-betting-green-dark text-white px-10 py-4 text-lg font-semibold transition-all hover:scale-105 w-full"
                  >
                    <Trophy className="mr-3 h-6 w-6" />
                    View Weekly Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TopSellersSection;
