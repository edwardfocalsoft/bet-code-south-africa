import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketsList from "@/components/tickets/TicketsList";
import TicketsTable from "@/components/tickets/TicketsTable";
import { useTickets } from "@/hooks/useTickets";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BETTING_SITES } from "@/data/mockData";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BettingSite } from "@/types";

const AllTickets: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  // Explicitly set role to "buyer" for this page
  const { tickets, loading, filters, updateFilters } = useTickets({
    fetchOnMount: true,
    filterExpired: true,
    role: "buyer"
  });
  const [priceRange, setPriceRange] = useState([0]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  
  // Handler for applying filters
  const handleApplyFilters = () => {
    updateFilters({
      bettingSite: filters.bettingSite,
      isFree: showFreeOnly ? true : undefined,
      maxPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    });
  };
  
  // Handler for resetting filters
  const handleResetFilters = () => {
    setPriceRange([0]);
    setShowFreeOnly(false);
    updateFilters({
      bettingSite: undefined,
      isFree: undefined,
      maxPrice: undefined,
    });
  };

  const handleBettingSiteChange = (value: string) => {
    updateFilters({ 
      bettingSite: value === "all" ? "all" : value as BettingSite 
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">All Betting Tickets</h1>
          
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Tickets</SheetTitle>
                  <SheetDescription>
                    Set filters to narrow down your ticket search
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="betting-site">Betting Site</Label>
                    <Select 
                      value={filters.bettingSite || "all"} 
                      onValueChange={handleBettingSiteChange}
                    >
                      <SelectTrigger id="betting-site">
                        <SelectValue placeholder="All Sites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        {BETTING_SITES.map((site) => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Maximum Price (R{priceRange[0]})</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      step={10}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="free-only">Free Tickets Only</Label>
                    <Switch 
                      id="free-only" 
                      checked={showFreeOnly} 
                      onCheckedChange={setShowFreeOnly} 
                    />
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button onClick={handleApplyFilters}>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
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
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground">
            Browse all available betting tickets from verified sellers.
            Use the filter button to narrow down your search.
          </p>
        </div>
        
        {viewMode === "cards" ? (
          <TicketsList
            tickets={tickets}
            emptyMessage="No tickets available matching your filters."
          />
        ) : (
          <TicketsTable
            tickets={tickets}
            emptyMessage="No tickets available matching your filters."
          />
        )}
      </div>
    </Layout>
  );
};

export default AllTickets;
