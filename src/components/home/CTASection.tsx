import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-betting-black">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-2xl font-medium mb-6">Stop Guessing. Start Winning.</h2>
        <p className="text-lg text-muted-foreground mb-8">
          The Oracle uses real-time data and AI to help you make smarter bets. Join thousands of South African punters who've already upgraded their game.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/oracle">
            <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg gap-2">
              <Brain className="h-5 w-5" /> Try the Oracle Now
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
