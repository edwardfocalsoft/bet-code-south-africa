
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useTickets } from "@/hooks/useTickets";
import { BettingSite } from "@/types";
import TicketsList from "@/components/tickets/TicketsList";
import TicketsTable from "@/components/tickets/TicketsTable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/purchases/LoadingState";

const AllTickets: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedSite, setSelectedSite] = useState<BettingSite | "all">("all");

  const { tickets, loading, updateFilters } = useTickets({
    fetchOnMount: true,
    filterExpired: true,
    role: "buyer" // Important: Set role as buyer to ensure proper filtering
  });

  const handleSiteChange = (site: BettingSite | "all") => {
    setSelectedSite(site);
    updateFilters({
      bettingSite: site === "all" ? undefined : site,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">All Tickets</h1>
        
        <div className="betting-card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-medium mb-4">Filter By Betting Site</h2>
              <RadioGroup
                defaultValue="all"
                value={selectedSite}
                onValueChange={(value) => handleSiteChange(value as BettingSite | "all")}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Sites</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Betway" id="betway" />
                  <Label htmlFor="betway">Betway</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HollywoodBets" id="hollywood" />
                  <Label htmlFor="hollywood">HollywoodBets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Supabets" id="supabets" />
                  <Label htmlFor="supabets">Supabets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Playa" id="playa" />
                  <Label htmlFor="playa">Playa</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center gap-4">
              <div
                className={`cursor-pointer p-2 rounded ${
                  viewMode === "grid" ? "bg-betting-green text-white" : "bg-betting-dark-gray text-white"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </div>
              <div
                className={`cursor-pointer p-2 rounded ${
                  viewMode === "table" ? "bg-betting-green text-white" : "bg-betting-dark-gray text-white"
                }`}
                onClick={() => setViewMode("table")}
              >
                Table View
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          {loading ? (
            <LoadingState />
          ) : viewMode === "grid" ? (
            <TicketsList 
              tickets={tickets} 
              emptyMessage="No tickets found. Please try another filter or check back later."
            />
          ) : (
            <TicketsTable 
              tickets={tickets} 
              emptyMessage="No tickets found. Please try another filter or check back later."
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllTickets;
