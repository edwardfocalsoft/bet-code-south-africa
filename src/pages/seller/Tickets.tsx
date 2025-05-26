
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BettingTicket } from "@/types";
import { toast } from "sonner";
import { isPast } from "date-fns";
import { LoadingState } from "@/components/purchases/LoadingState";
import TicketFilters from "@/components/seller/tickets/TicketFilters";
import EmptyTicketsState from "@/components/seller/tickets/EmptyTicketsState";
import TicketsTable from "@/components/seller/tickets/TicketsTable";
import { Pagination } from "@/components/ui/pagination";

const SellerTickets: React.FC = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<BettingTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (currentUser?.id) {
      fetchTickets();
    }
  }, [currentUser, currentPage, activeFilter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // Get total count for pagination
      let countQuery = supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("seller_id", currentUser?.id);

      // Apply filter to count query
      if (activeFilter === 'active') {
        const now = new Date().toISOString();
        countQuery = countQuery.gt('kickoff_time', now).eq('is_hidden', false);
      } else if (activeFilter === 'expired') {
        const now = new Date().toISOString();
        countQuery = countQuery.lt('kickoff_time', now);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const totalRecords = count || 0;
      const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
      setTotalPages(calculatedTotalPages || 1);

      // Fetch tickets with pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("tickets")
        .select("*")
        .eq("seller_id", currentUser?.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply filter to data query
      if (activeFilter === 'active') {
        const now = new Date().toISOString();
        query = query.gt('kickoff_time', now).eq('is_hidden', false);
      } else if (activeFilter === 'expired') {
        const now = new Date().toISOString();
        query = query.lt('kickoff_time', now);
      }
      
      const { data, error } = await query;
      
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
      
      // Refetch to update pagination
      fetchTickets();
    } catch (error: any) {
      toast.error(`Error deleting ticket: ${error.message}`);
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
          <LoadingState />
        ) : (
          <>
            <TicketFilters 
              activeFilter={activeFilter} 
              setActiveFilter={setActiveFilter} 
            />
            
            {tickets.length === 0 ? (
              <EmptyTicketsState activeFilter={activeFilter} />
            ) : (
              <>
                <TicketsTable 
                  tickets={tickets} 
                  onToggleVisibility={toggleTicketVisibility}
                  onDelete={deleteTicket}
                />
                
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SellerTickets;
