import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket } from "@/types";
import { 
  BarChart, Download, Loader2, AlertCircle, ChevronDown
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTickets } from "@/hooks/useTickets";
import { isPast } from "date-fns";
import TicketsTable from "@/components/admin/tickets/TicketsTable";
import TicketsFilter from "@/components/admin/tickets/TicketsFilter";
import TicketsStats from "@/components/admin/tickets/TicketsStats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface TicketWithSeller extends BettingTicket {
  sellerEmail: string;
}

type TicketFilter = "all" | "active" | "expired" | "hidden";
type SortField = "title" | "price" | "kickoffTime" | "createdAt";
type SortOrder = "asc" | "desc";

interface TicketsFilterState {
  searchTerm: string;
  bettingSite: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortField: SortField;
  sortOrder: SortOrder;
}

interface StatsData {
  totalTickets: number;
  activeTickets: number;
  expiredTickets: number;
  hiddenTickets: number;
  averagePrice: number;
  freeTickets: number;
  bySite: Record<string, number>;
}

const AdminTickets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TicketFilter>("active");
  const [tickets, setTickets] = useState<TicketWithSeller[]>([]);
  const [allTickets, setAllTickets] = useState<TicketWithSeller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketsFilterState>({
    searchTerm: "",
    bettingSite: null,
    minPrice: null,
    maxPrice: null,
    sortField: "createdAt",
    sortOrder: "desc"
  });
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { toggleTicketVisibility, markTicketAsExpired } = useTickets({
    fetchOnMount: false,
    filterExpired: false,
    role: "admin"
  });

  const fetchTickets = async (filter: TicketFilter = "active") => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("tickets")
        .select(`
          *,
          profiles:seller_id (
            username,
            email
          )
        `);
      
      switch (filter) {
        case "active":
          query = query.eq("is_hidden", false);
          const now = new Date().toISOString();
          query = query.gt("kickoff_time", now);
          query = query.eq("is_expired", false);
          break;
        case "expired":
          query = query.or(`is_expired.eq.true,kickoff_time.lt.${new Date().toISOString()}`);
          break;
        case "hidden":
          query = query.eq("is_hidden", true);
          break;
      }
      
      query = query.order("created_at", { ascending: false });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const formattedTickets = data.map((ticket: any) => {
        const kickoffTime = new Date(ticket.kickoff_time);
        const isExpiredByDate = isPast(kickoffTime);
        
        return {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          sellerId: ticket.seller_id,
          sellerUsername: ticket.profiles.username || "Unnamed Seller",
          sellerEmail: ticket.profiles.email,
          price: parseFloat(ticket.price),
          isFree: ticket.is_free,
          bettingSite: ticket.betting_site,
          kickoffTime: kickoffTime,
          createdAt: new Date(ticket.created_at),
          odds: ticket.odds ? parseFloat(ticket.odds) : undefined,
          isHidden: ticket.is_hidden,
          isExpired: ticket.is_expired || isExpiredByDate,
          eventResults: ticket.event_results
        };
      });
      
      setAllTickets(formattedTickets);
      applyFilters(formattedTickets, filters);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      setError(error.message || "Failed to fetch tickets");
      toast({
        title: "Error",
        description: "Failed to load tickets data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (ticketsToFilter: TicketWithSeller[], filterState: TicketsFilterState) => {
    let filtered = [...ticketsToFilter];
    
    if (filterState.searchTerm) {
      const search = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(search) || 
        ticket.sellerUsername.toLowerCase().includes(search) ||
        ticket.sellerEmail.toLowerCase().includes(search)
      );
    }
    
    if (filterState.bettingSite) {
      filtered = filtered.filter(ticket => ticket.bettingSite === filterState.bettingSite);
    }
    
    if (filterState.minPrice !== null) {
      filtered = filtered.filter(ticket => ticket.price >= (filterState.minPrice || 0));
    }
    
    if (filterState.maxPrice !== null) {
      filtered = filtered.filter(ticket => ticket.price <= (filterState.maxPrice || 9999999));
    }
    
    filtered.sort((a, b) => {
      const field = filterState.sortField;
      const order = filterState.sortOrder === "desc" ? 1 : -1;
      
      if (field === "title") {
        return a.title.localeCompare(b.title) * order;
      } else if (field === "price") {
        return (a.price - b.price) * order;
      } else if (field === "kickoffTime") {
        return (a.kickoffTime.getTime() - b.kickoffTime.getTime()) * order;
      } else {
        return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
      }
    });
    
    setTickets(filtered);
  };

  const generateStats = () => {
    setStatsLoading(true);
    
    const allTicketsData = allTickets;
    if (allTicketsData.length === 0) {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    
    const bySite: Record<string, number> = {};
    let totalPrice = 0;
    let freeTickets = 0;
    
    allTicketsData.forEach(ticket => {
      if (ticket.bettingSite) {
        bySite[ticket.bettingSite] = (bySite[ticket.bettingSite] || 0) + 1;
      }
      
      if (ticket.isFree) {
        freeTickets++;
      } else {
        totalPrice += ticket.price;
      }
    });
    
    const activeTicketsCount = allTicketsData.filter(t => !t.isExpired && !t.isHidden).length;
    const expiredTicketsCount = allTicketsData.filter(t => t.isExpired).length;
    const hiddenTicketsCount = allTicketsData.filter(t => t.isHidden).length;
    const nonFreeTickets = allTicketsData.length - freeTickets;
    
    setStats({
      totalTickets: allTicketsData.length,
      activeTickets: activeTicketsCount,
      expiredTickets: expiredTicketsCount,
      hiddenTickets: hiddenTicketsCount,
      averagePrice: nonFreeTickets > 0 ? totalPrice / nonFreeTickets : 0,
      freeTickets,
      bySite
    });
    
    setStatsLoading(false);
  };

  const exportTickets = () => {
    setExportLoading(true);
    
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Title,Seller,Email,Price,Betting Site,Kickoff Time,Created At,Hidden,Expired\n";
      
      tickets.forEach(ticket => {
        const row = [
          `"${ticket.title.replace(/"/g, '""')}"`,
          `"${ticket.sellerUsername.replace(/"/g, '""')}"`,
          ticket.sellerEmail,
          ticket.isFree ? "Free" : ticket.price,
          ticket.bettingSite,
          ticket.kickoffTime.toLocaleString(),
          ticket.createdAt.toLocaleString(),
          ticket.isHidden ? "Yes" : "No",
          ticket.isExpired ? "Yes" : "No"
        ];
        
        csvContent += row.join(",") + "\n";
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `tickets-export-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: `Exported ${tickets.length} tickets to CSV file.`
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Failed to export tickets data.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === "desc" ? "asc" : "desc"
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  const handleBettingSiteChange = (site: string | null) => {
    setFilters(prev => ({
      ...prev,
      bettingSite: site
    }));
  };

  const uniqueBettingSites = [...new Set(allTickets.map(ticket => ticket.bettingSite))];

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    if (showStats) {
      generateStats();
    }
  }, [showStats]);

  useEffect(() => {
    if (allTickets.length > 0) {
      applyFilters(allTickets, filters);
    }
  }, [filters, allTickets]);

  const tabOptions = [
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "hidden", label: "Hidden" },
    { value: "all", label: "All" }
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === activeTab)?.label || "Active";

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <AdminTicketsHeader 
        setShowStats={setShowStats} 
        exportTickets={exportTickets}
        exportLoading={exportLoading}
        error={error}
      />
      
      {isMobile ? (
        <div className="container mx-auto space-y-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-betting-dark-gray border-betting-light-gray text-white hover:bg-betting-light-gray"
              >
                {currentTabLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-full bg-betting-dark-gray border-betting-light-gray"
              align="start"
            >
              {tabOptions.map((tab) => (
                <DropdownMenuItem
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as TicketFilter)}
                  className="text-gray-300 hover:text-white hover:bg-betting-light-gray cursor-pointer"
                >
                  {tab.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <TicketsFilter 
            searchTerm={filters.searchTerm}
            bettingSite={filters.bettingSite}
            onSearchChange={(value) => handleSearchChange(value)}
            onBettingSiteChange={(site) => handleBettingSiteChange(site)}
            uniqueBettingSites={uniqueBettingSites}
          />
          
          <div className="betting-card overflow-x-auto">
            <TicketsTable 
              tickets={tickets}
              loading={loading}
              onToggleVisibility={toggleTicketVisibility}
              onMarkExpired={markTicketAsExpired}
            />
          </div>
        </div>
      ) : (
        <Tabs 
          defaultValue="active" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as TicketFilter)}
          className="container mx-auto mb-6"
        >
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <TicketsFilter 
              searchTerm={filters.searchTerm}
              bettingSite={filters.bettingSite}
              onSearchChange={(value) => handleSearchChange(value)}
              onBettingSiteChange={(site) => handleBettingSiteChange(site)}
              uniqueBettingSites={uniqueBettingSites}
            />
            
            <div className="betting-card overflow-x-auto">
              <TicketsTable 
                tickets={tickets}
                loading={loading}
                onToggleVisibility={toggleTicketVisibility}
                onMarkExpired={markTicketAsExpired}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <TicketsStats stats={stats} loading={statsLoading} />
      </Dialog>
    </Layout>
  );
};

const AdminTicketsHeader: React.FC<{
  setShowStats: (show: boolean) => void;
  exportTickets: () => void;
  exportLoading: boolean;
  error: string | null;
}> = ({ setShowStats, exportTickets, exportLoading, error }) => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStats(true)}
            className="flex items-center gap-2"
          >
            <BarChart className="h-4 w-4" />
            Statistics
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportTickets}
            className="flex items-center gap-2"
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminTickets;
