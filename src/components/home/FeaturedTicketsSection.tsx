
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketsList from "@/components/tickets/TicketsList";
import TicketsTable from "@/components/tickets/TicketsTable";
import { BettingTicket } from "@/types";

interface FeaturedTicketsSectionProps {
  tickets: BettingTicket[];
  loading: boolean;
  viewMode: "cards" | "table";
  onViewModeChange: (value: "cards" | "table") => void;
}

const FeaturedTicketsSection: React.FC<FeaturedTicketsSectionProps> = ({
  tickets,
  loading,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <section className="py-16 px-4 bg-betting-dark-gray">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-betting-green" />
            <h2 className="text-2xl font-medium">Featured Tickets</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs defaultValue={viewMode} onValueChange={(value) => onViewModeChange(value as "cards" | "table")}>
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
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : viewMode === "cards" ? (
          <TicketsList
            tickets={tickets}
            emptyMessage="No featured tickets available at the moment."
          />
        ) : (
          <TicketsTable
            tickets={tickets}
            emptyMessage="No featured tickets available at the moment."
          />
        )}
      </div>
    </section>
  );
};

export default FeaturedTicketsSection;
