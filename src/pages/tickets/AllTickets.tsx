
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketsList from "@/components/tickets/TicketsList";
import TicketsTable from "@/components/tickets/TicketsTable";
import { mockTickets } from "@/data/mockData";

const AllTickets: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">All Betting Tickets</h1>
          
          <Tabs 
            defaultValue={viewMode} 
            onValueChange={(value) => setViewMode(value as "cards" | "table")}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-betting-black grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground">
            Browse all available betting tickets from verified sellers.
            Filter functionality coming soon.
          </p>
        </div>
        
        {viewMode === "cards" ? (
          <TicketsList
            tickets={mockTickets}
            emptyMessage="No tickets available at the moment."
          />
        ) : (
          <TicketsTable
            tickets={mockTickets}
            emptyMessage="No tickets available at the moment."
          />
        )}
      </div>
    </Layout>
  );
};

export default AllTickets;
