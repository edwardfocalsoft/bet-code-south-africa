
import React from "react";
import { Link } from "react-router-dom";
import { Award, TrendingUp, Star, Trophy } from "lucide-react";
import SellerCard from "@/components/sellers/SellerCard";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 mr-3 text-betting-green" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-betting-green bg-clip-text text-transparent">
              Top Performing Sellers
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our highest-rated sellers who consistently deliver winning predictions and exceptional value to our community.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-betting-green/10 mb-4">
              <TrendingUp className="h-8 w-8 text-betting-green animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground">Loading top performers...</p>
          </div>
        ) : (
          <>
            {sellers && sellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {sellers.map((seller, index) => {
                  const position = index + 1;
                  const isTopThree = position <= 3;
                  
                  return (
                    <div key={seller.id} className="relative group">
                      {/* Position Badge */}
                      {isTopThree && (
                        <div className="absolute -top-4 -left-4 z-10">
                          <Badge 
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                              ${position === 1 ? 'bg-yellow-500 text-yellow-900' : ''}
                              ${position === 2 ? 'bg-gray-400 text-gray-900' : ''}
                              ${position === 3 ? 'bg-amber-600 text-amber-100' : ''}
                            `}
                          >
                            #{position}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Enhanced Seller Card */}
                      <div className={`
                        transition-all duration-300 group-hover:scale-105 h-full
                        ${isTopThree 
                          ? 'border-betting-green' 
                          : 'hover:border-betting-green/50'
                        }
                      `}>
                        <SellerCard 
                          seller={{
                            ...seller,
                            ranking: seller.ranking || position,
                            sales_count: seller.sales_count || 0
                          }}
                          featured={isTopThree}
                        />
                        
                        {/* Performance Indicators */}
                        <div className="mt-4 pt-4 border-t border-betting-light-gray/30">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-betting-green" />
                              <span className="text-muted-foreground">Performance</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {seller.average_rating && seller.average_rating > 0 ? (
                                <>
                                  <span className="text-betting-green font-semibold">
                                    {seller.average_rating.toFixed(1)}
                                  </span>
                                  <Star className="h-3 w-3 fill-betting-green text-betting-green" />
                                </>
                              ) : (
                                <span className="text-muted-foreground">New seller</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-betting-light-gray/10 mb-6">
                  <Award className="h-10 w-10 text-betting-green/50" />
                </div>
                <h3 className="text-xl font-semibold mb-3">No Top Sellers Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our sellers are working hard to establish their rankings. Check back soon to see our top performers!
                </p>
              </div>
            )}
            
            {/* Call to Action */}
            <div className="text-center">
              <div className="inline-flex gap-4">
                <Link to="/sellers/leaderboard">
                  <Button 
                    size="lg" 
                    className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-3 text-lg"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Weekly Leaderboard
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
