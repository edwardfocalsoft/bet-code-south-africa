import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BettingTicket } from "@/types";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, Eye, EyeOff, Search, BarChart, Filter, 
  ArrowUpDown, Download, Loader2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTickets } from "@/hooks/useTickets";
import { isPast } from "date-fns";

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

  // Use the enhanced useTickets hook with role set to "admin"
  const { fetchTickets: hookFetchTickets } = useTickets({
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
          // For active tickets, ensure both is_expired is false AND kickoff time hasn't passed
          query = query.eq("is_hidden", false);
          const now = new Date().toISOString();
          query = query.gt("kickoff_time", now); // Only future kickoff times
          query = query.eq("is_expired", false); // And not manually expired
          break;
        case "expired":
          // For expired tickets, include either is_expired = true OR kickoff_time in the past
          query = query.or(`is_expired.eq.true,kickoff_time.lt.${new Date().toISOString()}`);
          break;
        case "hidden":
          query = query.eq("is_hidden", true);
          break;
        // "all" doesn't need a filter
      }
      
      // Order by most recent first
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
          // Make sure to mark tickets as expired if kickoff time has passed
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
    
    // Apply search
    if (filterState.searchTerm) {
      const search = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(search) || 
        ticket.sellerUsername.toLowerCase().includes(search) ||
        ticket.sellerEmail.toLowerCase().includes(search)
      );
    }
    
    // Apply betting site filter
    if (filterState.bettingSite) {
      filtered = filtered.filter(ticket => ticket.bettingSite === filterState.bettingSite);
    }
    
    // Apply price filters
    if (filterState.minPrice !== null) {
      filtered = filtered.filter(ticket => ticket.price >= (filterState.minPrice || 0));
    }
    
    if (filterState.maxPrice !== null) {
      filtered = filtered.filter(ticket => ticket.price <= (filterState.maxPrice || 9999999));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const field = filterState.sortField;
      const order = filterState.sortOrder === "desc" ? 1 : -1;
      
      if (field === "title") {
        return a.title.localeCompare(b.title) * order;
      } else if (field === "price") {
        return (a.price - b.price) * order;
      } else if (field === "kickoffTime") {
        return (a.kickoffTime.getTime() - b.kickoffTime.getTime()) * order;
      } else { // createdAt
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
      // Create CSV content
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
      
      // Create and trigger download
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

  const renderTicketsTable = () => {
    if (loading) {
      return Array(5).fill(0).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
      ));
    }
    
    if (tickets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
            No tickets found in this category.
          </TableCell>
        </TableRow>
      );
    }
    
    return tickets.map((ticket) => (
      <TableRow key={ticket.id}>
        <TableCell>
          <Link to={`/tickets/${ticket.id}`} className="hover:text-betting-green font-medium">
            {ticket.title}
          </Link>
          {ticket.isFree && (
            <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-500">
              Free
            </Badge>
          )}
          {ticket.isHidden && (
            <Badge variant="outline" className="ml-2 bg-red-900/30 text-red-400 border-red-500">
              Hidden
            </Badge>
          )}
          {ticket.isExpired && (
            <Badge variant="outline" className="ml-2 bg-gray-900/30 text-gray-400 border-gray-500">
              Expired
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <Link to={`/sellers/${ticket.sellerId}`} className="hover:text-betting-green">
            {ticket.sellerUsername}
          </Link>
        </TableCell>
        <TableCell>{ticket.bettingSite}</TableCell>
        <TableCell>
          {ticket.isFree ? (
            <span className="text-green-400">Free</span>
          ) : (
            <span>R {ticket.price.toFixed(2)}</span>
          )}
        </TableCell>
        <TableCell>{ticket.kickoffTime.toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleTicketVisibility(ticket.id, !ticket.isHidden)}
            >
              {ticket.isHidden ? (
                <>
                  <Eye className="h-4 w-4 mr-1" /> Show
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" /> Hide
                </>
              )}
            </Button>
            
            {!ticket.isExpired && (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-500"
                onClick={() => markTicketAsExpired(ticket.id, true)}
              >
                Mark Expired
              </Button>
            )}
            
            {ticket.isExpired && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-500"
                onClick={() => markTicketAsExpired(ticket.id, false)}
              >
                Restore
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  const uniqueBettingSites = [...new Set(allTickets.map(ticket => ticket.bettingSite))];

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
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
        
        <Tabs 
          defaultValue="active" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as TicketFilter)}
          className="mb-6"
        >
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="bg-betting-dark-gray p-4 rounded-lg mb-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      className="pl-8"
                      value={filters.searchTerm}
                      onChange={e => setFilters({...filters, searchTerm: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setFilters({...filters, bettingSite: null})}>
                          All Betting Sites
                        </DropdownMenuItem>
                        {uniqueBettingSites.map((site, idx) => (
                          <DropdownMenuItem 
                            key={idx} 
                            onClick={() => setFilters({...filters, bettingSite: site as string})}
                          >
                            {site}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {filters.bettingSite && (
                <div className="flex gap-2 items-center mb-2">
                  <Badge className="bg-betting-accent">
                    Site: {filters.bettingSite}
                    <button 
                      className="ml-2" 
                      onClick={() => setFilters({...filters, bettingSite: null})}
                    >
                      ×
                    </button>
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="betting-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                      Title
                      {filters.sortField === "title" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Betting Site</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                      Price
                      {filters.sortField === "price" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("kickoffTime")}>
                      Kickoff Time
                      {filters.sortField === "kickoffTime" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTicketsTable()}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket Statistics</DialogTitle>
            <DialogDescription>
              Overview of all tickets in the system
            </DialogDescription>
          </DialogHeader>
          
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{stats.totalTickets}</p>
                </div>
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Active Tickets</p>
                  <p className="text-2xl font-bold text-green-500">{stats.activeTickets}</p>
                </div>
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Avg Price</p>
                  <p className="text-2xl font-bold">R {stats.averagePrice.toFixed(2)}</p>
                </div>
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Free Tickets</p>
                  <p className="text-2xl font-bold text-green-500">{stats.freeTickets}</p>
                </div>
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.expiredTickets}</p>
                </div>
                <div className="bg-betting-dark-gray rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Hidden</p>
                  <p className="text-2xl font-bold text-red-500">{stats.hiddenTickets}</p>
                </div>
              </div>
              
              <div className="bg-betting-dark-gray rounded-md p-4">
                <p className="text-sm font-medium mb-2">Distribution by Betting Site</p>
                <div className="space-y-2">
                  {Object.entries(stats.bySite).map(([site, count]) => (
                    <div key={site} className="flex justify-between text-sm">
                      <span>{site}</span>
                      <span>{count} tickets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No data available</p>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminTickets;
