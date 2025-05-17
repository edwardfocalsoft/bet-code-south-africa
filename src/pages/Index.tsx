import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TicketsList from "@/components/tickets/TicketsList";
import TicketsTable from "@/components/tickets/TicketsTable";
import SellerCard from "@/components/sellers/SellerCard";
import { BettingTicket, User } from "@/types";
import { BETTING_SITES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Award, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTickets } from "@/hooks/useTickets";
import { useSellers } from "@/hooks/useSellers";

const BettingSiteLogo = ({ site }: { site: string }) => {
  // In a real app, we would fetch these from Supabase storage
  // But for now, we'll use a placeholder with the name
  return (
    <div className="betting-card flex items-center justify-center py-6 font-medium text-center">
      <div className="bg-betting-dark-gray p-2 rounded-lg flex items-center justify-center h-16">
        <span className="font-bold text-betting-green">{site}</span>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { toast } = useToast();
  const { tickets: allTickets, loading: ticketsLoading } = useTickets();
  const { sellers: allSellers, loading: sellersLoading } = useSellers();
  
  // Filter for featured tickets (non-expired tickets, limit to 6)
  const featuredTickets = allTickets
    .filter(ticket => !ticket.isExpired)
    .slice(0, 6);
  
  // Filter for top sellers (limit to 3)
  const topSellers = allSellers.slice(0, 3);

  return (
    <Layout isHomePage={true}>
      {/* Hero Section with enhanced animation */}
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
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto animate-slide-up delay-200">
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
      
      {/* Betting Sites Section with Logos */}
      <section className="py-16 px-4 bg-betting-black">
        <div className="container mx-auto">
          <h2 className="text-xl font-medium mb-8 text-center">
            Compatible with All Major South African Betting Sites
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {BETTING_SITES.map((site) => (
              <BettingSiteLogo key={site} site={site} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Tickets Section with Toggle between Card and Table view */}
      <section className="py-16 px-4 bg-betting-dark-gray">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-betting-green" />
              <h2 className="text-2xl font-medium">Featured Tickets</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <Tabs defaultValue="cards" onValueChange={(value) => setViewMode(value as "cards" | "table")}>
                <TabsList className="bg-betting-black">
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Link to="/tickets" className="text-betting-green hover:underline">
                View all tickets
              </Link>
            </div>
          </div>
          
          {ticketsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : viewMode === "cards" ? (
            <TicketsList
              tickets={featuredTickets}
              emptyMessage="No featured tickets available at the moment."
            />
          ) : (
            <TicketsTable
              tickets={featuredTickets}
              emptyMessage="No featured tickets available at the moment."
            />
          )}
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
          
          {sellersLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading sellers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topSellers.length > 0 ? (
                topSellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">No sellers available at the moment.</p>
                </div>
              )}
            </div>
          )}
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
      
      {/* CTA Section with enhanced design */}
      <section className="py-20 px-4 bg-betting-black">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Win With BetCode ZA?</h2>
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
    </Layout>
  );
};

export default Index;
