import React from "react";
import { Brain, Target, Trophy } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <h2 className="text-2xl font-medium text-center mb-12">How BetCode South Africa Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="betting-card text-center">
            <div className="bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Ask the Oracle</h3>
            <p className="text-muted-foreground">
              Use AI-powered predictions built on live fixture data to find the smartest bets of the day.
            </p>
          </div>

          <div className="betting-card text-center">
            <div className="bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Place Smarter Bets</h3>
            <p className="text-muted-foreground">
              Apply filters for goals, corners, BTTS and more — or browse bet codes from top-rated tipsters.
            </p>
          </div>

          <div className="betting-card text-center">
            <div className="bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Win & Earn</h3>
            <p className="text-muted-foreground">
              Track your results, earn BC loyalty points, and climb the leaderboard as a smarter punter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
