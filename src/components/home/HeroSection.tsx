
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black pt-16 pb-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          South Africa's Premier{" "}
          <span className="text-betting-green bg-clip-text text-transparent bg-gradient-to-r from-betting-green to-teal-500">Betting Code</span>{" "}
          Marketplace
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
          Join thousands of smart bettors sharing and selling winning predictions across all major South African betting sites.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Active Bettors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">75%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">R5M+</div>
            <div className="text-sm text-muted-foreground">Payouts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-betting-green mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
