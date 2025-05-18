
import React from "react";
import { Link } from "react-router-dom";
import { Star, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FeaturedSellerSection: React.FC = () => {
  // This would typically come from an API call
  const featuredSeller = {
    id: "1",
    username: "PremierPunter",
    winRate: 78,
    totalTickets: 345,
    rating: 4.8,
    description: "Specialist in Premier League and Champions League predictions with an excellent track record in both teams to score markets."
  };

  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium flex items-center">
            <Award className="h-6 w-6 mr-2 text-betting-green" />
            Featured Seller of the Week
          </h2>
          <Link to="/sellers/leaderboard" className="text-betting-green hover:underline font-medium">
            View Leaderboard
          </Link>
        </div>

        <Card className="betting-card bg-betting-black border-betting-light-gray overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-6 md:border-r border-betting-light-gray">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-betting-dark-gray flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-betting-green">PP</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{featuredSeller.username}</h3>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{featuredSeller.rating}/5</span>
                  </div>
                  <Link to={`/sellers/${featuredSeller.id}`}>
                    <Button variant="outline" className="text-betting-green border-betting-green hover:bg-betting-green/10">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 md:col-span-2">
                <h4 className="text-lg font-semibold mb-4">Why {featuredSeller.username} is Featured</h4>
                <p className="text-muted-foreground mb-6">
                  {featuredSeller.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
                    <div className="text-2xl font-bold text-betting-green">{featuredSeller.winRate}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
                    <div className="text-2xl font-bold text-betting-green">{featuredSeller.totalTickets}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Tickets</div>
                  </div>
                  <div className="text-center p-3 bg-betting-dark-gray rounded-lg">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-betting-green" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Trending</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedSellerSection;
