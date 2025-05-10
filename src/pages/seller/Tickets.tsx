
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreVertical, ExternalLink, Edit, Trash2, Eye, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BettingTicket } from "@/types";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

const SellerTickets: React.FC = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    if (currentUser?.id) {
      fetchTickets();
    }
  }, [currentUser]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("seller_id", currentUser?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Convert the data to match the BettingTicket type
      const typedTickets: BettingTicket[] = data.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        sellerId: ticket.seller_id,
        sellerUsername: "", // We'll need to fetch this from profiles
        price: ticket.price,
        isFree: ticket.is_free,
        bettingSite: ticket.betting_site,
        kickoffTime: new Date(ticket.kickoff_time),
        createdAt: new Date(ticket.created_at),
        odds: ticket.odds,
        isHidden: ticket.is_hidden,
        isExpired: ticket.is_expired || isPast(new Date(ticket.kickoff_time)),
        eventResults: ticket.event_results
      }));
      
      setTickets(typedTickets);
    } catch (error: any) {
      toast.error(`Error fetching tickets: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTicketVisibility = async (ticketId: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ is_hidden: !currentHidden })
        .eq("id", ticketId);
      
      if (error) throw error;
      
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, isHidden: !currentHidden } 
          : ticket
      ));
      
      toast.success(`Ticket ${currentHidden ? 'published' : 'hidden'} successfully`);
    } catch (error: any) {
      toast.error(`Error updating ticket: ${error.message}`);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);
      
      if (error) throw error;
      
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      toast.success("Ticket deleted successfully");
    } catch (error: any) {
      toast.error(`Error deleting ticket: ${error.message}`);
    }
  };

  const getFilteredTickets = () => {
    switch (activeFilter) {
      case 'active':
        return tickets.filter(ticket => !ticket.isExpired && !ticket.isHidden);
      case 'expired':
        return tickets.filter(ticket => ticket.isExpired);
      default:
        return tickets;
    }
  };

  const filteredTickets = getFilteredTickets();

  const renderTicketStatusBadge = (ticket: BettingTicket) => {
    if (ticket.isExpired) {
      return <Badge className="bg-gray-500">Expired</Badge>;
    } else if (ticket.isHidden) {
      return <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>;
    } else {
      return <Badge className="bg-betting-green">Active</Badge>;
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <Link to="/seller/tickets/create">
            <Button className="bg-betting-green hover:bg-betting-green-dark flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Ticket
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex gap-2">
                <Button 
                  variant={activeFilter === 'all' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={activeFilter === 'active' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveFilter('active')}
                >
                  Active
                </Button>
                <Button 
                  variant={activeFilter === 'expired' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveFilter('expired')}
                >
                  Expired
                </Button>
              </div>
            </div>
            
            {filteredTickets.length === 0 ? (
              <Card className="betting-card">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="mb-4">
                      {activeFilter === 'all' ? (
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      ) : activeFilter === 'active' ? (
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      ) : (
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeFilter === 'all' 
                        ? "You haven't created any tickets yet."
                        : activeFilter === 'active'
                        ? "You don't have any active tickets."
                        : "You don't have any expired tickets."
                      }
                    </p>
                    <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                      <Link to="/seller/tickets/create">Create Your First Ticket</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="betting-card">
                <CardHeader>
                  <CardTitle>Betting Tickets</CardTitle>
                  <CardDescription>
                    Manage your betting tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Odds</TableHead>
                          <TableHead>Kickoff</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.title}</TableCell>
                            <TableCell>
                              {ticket.isFree ? (
                                <span className="text-betting-green">Free</span>
                              ) : (
                                `R${ticket.price.toFixed(2)}`
                              )}
                            </TableCell>
                            <TableCell>{ticket.odds?.toFixed(2)}</TableCell>
                            <TableCell>{format(ticket.kickoffTime, "dd MMM yyyy HH:mm")}</TableCell>
                            <TableCell>{renderTicketStatusBadge(ticket)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Link to={`/tickets/${ticket.id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>View</span>
                                    </DropdownMenuItem>
                                  </Link>
                                  
                                  {!ticket.isExpired && (
                                    <>
                                      <Link to={`/seller/tickets/edit/${ticket.id}`}>
                                        <DropdownMenuItem>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Edit</span>
                                        </DropdownMenuItem>
                                      </Link>
                                      <DropdownMenuItem onClick={() => toggleTicketVisibility(ticket.id, Boolean(ticket.isHidden))}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>{ticket.isHidden ? "Show" : "Hide"}</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  <DropdownMenuItem onClick={() => deleteTicket(ticket.id)} className="text-red-500 focus:text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SellerTickets;
