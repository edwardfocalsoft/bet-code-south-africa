
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
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface TicketWithSeller extends BettingTicket {
  sellerEmail: string;
}

type TicketFilter = "all" | "active" | "expired" | "hidden";

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithSeller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TicketFilter>("active");
  const { toast } = useToast();

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
          query = query.eq("is_expired", false).eq("is_hidden", false);
          break;
        case "expired":
          query = query.eq("is_expired", true);
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
      
      const formattedTickets = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        sellerId: ticket.seller_id,
        sellerUsername: ticket.profiles.username || "Unnamed Seller",
        sellerEmail: ticket.profiles.email,
        price: parseFloat(ticket.price),
        isFree: ticket.is_free,
        bettingSite: ticket.betting_site,
        kickoffTime: new Date(ticket.kickoff_time),
        createdAt: new Date(ticket.created_at),
        odds: ticket.odds ? parseFloat(ticket.odds) : undefined,
        isHidden: ticket.is_hidden,
        isExpired: ticket.is_expired,
        eventResults: ticket.event_results
      }));
      
      setTickets(formattedTickets);
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

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);

  const toggleTicketVisibility = async (ticketId: string, hide: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ is_hidden: hide })
        .eq("id", ticketId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Ticket ${hide ? "hidden" : "unhidden"} successfully.`,
      });
      
      fetchTickets(activeTab);
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket visibility.",
        variant: "destructive",
      });
    }
  };

  const markTicketAsExpired = async (ticketId: string, expired: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ is_expired: expired })
        .eq("id", ticketId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Ticket marked as ${expired ? "expired" : "active"} successfully.`,
      });
      
      fetchTickets(activeTab);
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status.",
        variant: "destructive",
      });
    }
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

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Tickets</h1>
        
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
            <div className="betting-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Betting Site</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Kickoff Time</TableHead>
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
    </Layout>
  );
};

export default AdminTickets;
