
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TicketsList from "@/components/tickets/TicketsList";
import SellerCard from "@/components/sellers/SellerCard";
import { BettingTicket, User } from "@/types";
import { mockTickets, mockUsers, BETTING_SITES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Award, CheckCircle, Clock } from "lucide-react";

const Index: React.FC = () => {
  const [featuredTickets, setFeaturedTickets] = useState<BettingTicket[]>([]);
  const [topSellers, setTopSellers] = useState<User[]>([]);
  
  useEffect(() => {
    // Get non-expired tickets for featured section
    const now = new Date();
    const validTickets = mockTickets.filter(
      (ticket) => new Date(ticket.kickoffTime) > now
    );
    setFeaturedTickets(validTickets.slice(0, 3));
    
    // Get top sellers
    const sellers = mockUsers.filter(
      (user) => user.role === "seller" && user.approved
    );
    setTopSellers(sellers.slice(0, 3));
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black pt-16 pb-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            South Africa's Premier{" "}
            <span className="text-betting-green">Betting Code</span>{" "}
            Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of smart bettors sharing and selling winning predictions across all major South African betting sites.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for tickets or sellers..."
                className="pl-10 py-6 bg-betting-dark-gray border-betting-light-gray text-white rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Betting Sites Section */}
      <section className="py-16 px-4 bg-betting-black">
        <div className="container mx-auto">
          <h2 className="text-xl font-medium mb-8 text-center">
            Compatible with All Major South African Betting Sites
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {BETTING_SITES.map((site) => (
              <div
                key={site}
                className="betting-card flex items-center justify-center py-6 font-medium text-center"
              >
                {site}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Tickets Section */}
      <section className="py-16 px-4 bg-betting-dark-gray">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-betting-green" />
              Featured Tickets
            </h2>
            <Link to="/tickets" className="text-betting-green hover:underline">
              View all tickets
            </Link>
          </div>
          
          <TicketsList
            tickets={featuredTickets}
            emptyMessage="No featured tickets available at the moment."
          />
        </div>
      </section>
      
      {/* Top Sellers Section */}
      <section className="py-16 px-4 bg-betting-black">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium flex items-center">
              <Award className="h-5 w-5 mr-2 text-betting-green" />
              Top Sellers
            </h2>
            <Link to="/sellers" className="text-betting-green hover:underline">
              View all sellers
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4 bg-betting-dark-gray">
        <div className="container mx-auto">
          <h2 className="text-2xl font-medium text-center mb-12">How BetCode ZA Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="betting-card text-center">
              <div className="bg-betting-green/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-betting-green" />
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
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-betting-black">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Win With BetCode ZA?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community of smart bettors and get access to premium betting codes from South Africa's top predictors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-betting-green hover:bg-betting-green-dark text-white px-8 py-6 text-lg">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" className="border-betting-green text-betting-green hover:bg-betting-green/10 px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
