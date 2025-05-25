
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import FeaturedTicketsTable from "./FeaturedTicketsTable";
import { BettingTicket } from "@/types";

interface FeaturedTicketsSectionProps {
  tickets: BettingTicket[];
  loading: boolean;
}

const FeaturedTicketsSection: React.FC<FeaturedTicketsSectionProps> = ({
  tickets,
  loading,
}) => {
  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-betting-green" />
            <h2 className="text-2xl font-medium">Featured Tickets</h2>
          </div>
          
          <Link to="/tickets" className="text-betting-green hover:underline">
            View all tickets
          </Link>
        </div>
        
        <FeaturedTicketsTable 
          tickets={tickets}
          loading={loading}
        />
      </div>
    </section>
  );
};

export default FeaturedTicketsSection;
