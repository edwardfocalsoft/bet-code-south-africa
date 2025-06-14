import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-betting-black">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-2xl font-medium mb-6">Ready to Win With BetCode South Africa?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join our community of smart bettors and get access to premium betting codes from South Africa's top predictors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth/register">
            <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg">
              Sign Up Now
            </Button>
          </Link>
          <Link to="/tickets">
            <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg">
              Browse Tickets
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
