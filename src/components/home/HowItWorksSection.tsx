
import React from "react";
import { CheckCircle, Award } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <h2 className="text-2xl font-medium text-center mb-12">How BetCode South Africa Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="betting-card text-center">
            <div className="bg-betting-green/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-betting-green" />
            </div>
            <h3 className="text-xl font-medium mb-2">Find Tickets</h3>
            <p className="text-muted-foreground">
              Browse our marketplace for free and premium betting codes from verified sellers.
            </p>
          </div>
          
          <div className="betting-card text-center">
            <div className="bg-betting-green/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-betting-green" />
            </div>
            <h3 className="text-xl font-medium mb-2">Place Your Bets</h3>
            <p className="text-muted-foreground">
              Use the codes on your preferred South African betting site and track your results.
            </p>
          </div>
          
          <div className="betting-card text-center">
            <div className="bg-betting-green/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-betting-green" />
            </div>
            <h3 className="text-xl font-medium mb-2">Earn Rewards</h3>
            <p className="text-muted-foreground">
              Rate sellers, mark winning tickets, and earn loyalty points for future discounts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
