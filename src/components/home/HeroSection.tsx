
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black pt-16 pb-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/public/bg-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          South Africa's Premier{" "}
          <span className="text-betting-green bg-clip-text text-transparent bg-gradient-to-r from-betting-green to-teal-500">Betting Code</span>{" "}
          Marketplace
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-slide-up">
          Join thousands of smart bettors sharing and selling winning predictions across all major South African betting sites.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up delay-100">
          <Link to="/tickets">
            <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg">
              Browse Tickets
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg">
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
