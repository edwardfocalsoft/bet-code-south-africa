
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Ticket, Users, Award } from "lucide-react";
import { User } from "@/types";
import SellerAvatar from "./featured-seller/SellerAvatar";
import SellerStats from "./featured-seller/SellerStats";

interface FeaturedSellerSectionProps {
  seller: User | null;
  loading: boolean;
}

const FeaturedSellerSection: React.FC<FeaturedSellerSectionProps> = ({
  seller,
  loading,
}) => {
  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-medium text-white mb-6">
              Featured Tipster of the Week
            </h2>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-betting-green/10 mb-6">
              <Trophy className="h-10 w-10 text-betting-green animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground">Loading featured tipster...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!seller) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-medium text-white mb-6">
              Featured Tipster of the Week
            </h2>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-betting-light-gray/10 mb-8">
              <Award className="h-12 w-12 text-betting-green/50" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No Featured Tipster</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              We're selecting our next featured tipster. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-medium text-white mb-6">
            Featured Tipster of the Week
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Meet our top-performing tipster who has been delivering exceptional results and building a strong community following.
          </p>
        </div>
        
        <Card className="betting-card max-w-4xl mx-auto overflow-hidden">
          <div className="relative bg-gradient-to-r from-betting-green/20 to-betting-green/10 p-1">
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-betting-green text-white px-3 py-1 rounded-full text-sm font-medium">
                <Trophy className="h-4 w-4" />
                Featured
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                  <SellerAvatar seller={seller} />
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      This week's featured tipster has shown exceptional performance with consistently high win rates and customer satisfaction.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Link to={`/sellers/${seller.id}`}>
                        <Button 
                          size="lg" 
                          className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-3 font-semibold transition-all hover:scale-105 w-full sm:w-auto"
                        >
                          <Users className="mr-2 h-5 w-5" />
                          View Profile
                        </Button>
                      </Link>
                      
                      <Link to="/tickets">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="border-betting-green text-betting-green hover:bg-betting-green hover:text-white px-8 py-3 font-semibold transition-all w-full sm:w-auto"
                        >
                          <Ticket className="mr-2 h-5 w-5" />
                          Browse Tickets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div>
                  <SellerStats seller={seller} />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedSellerSection;
