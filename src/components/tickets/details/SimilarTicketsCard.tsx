
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid, isPast } from "date-fns";
import { BettingTicket } from "@/types";
import { useTicketMapper } from "@/hooks/tickets/useTicketMapper";

interface SimilarTicketsCardProps {
  ticketId: string;
  sellerId: string;
}

const SimilarTicketsCard: React.FC<SimilarTicketsCardProps> = ({ ticketId, sellerId }) => {
  const [similarTickets, setSimilarTickets] = useState<BettingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const { mapDatabaseTickets } = useTicketMapper();

  useEffect(() => {
    const fetchSimilarTickets = async () => {
      if (!sellerId) return;
      
      setLoading(true);
      try {
        const now = new Date().toISOString();
        
        // Get seller info first
        const { data: sellerData, error: sellerError } = await supabase
          .from("profiles")
          .select("username, verified")
          .eq("id", sellerId)
          .single();
          
        if (!sellerError && sellerData) {
          setSellerInfo(sellerData);
        }
        
        // Get tickets by the same seller, excluding current ticket and those with past kickoff
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            *,
            profiles:seller_id (username)
          `)
          .eq("seller_id", sellerId)
          .neq("id", ticketId)
          .eq("is_hidden", false)
          .eq("is_expired", false)
          .gt("kickoff_time", now) // Only get tickets where kickoff is in the future
          .order("created_at", { ascending: false })
          .limit(3);
          
        if (ticketsError) throw ticketsError;
        
        if (ticketsData && ticketsData.length > 0) {
          setSimilarTickets(mapDatabaseTickets(ticketsData));
        } else {
          setSimilarTickets([]);
        }
      } catch (err) {
        console.error("Error fetching similar tickets:", err);
        setSimilarTickets([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSimilarTickets();
  }, [ticketId, sellerId, mapDatabaseTickets]);

  return (
    <Card className="betting-card">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Similar Tickets</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-betting-green" />
          </div>
        ) : similarTickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No similar tickets found for this seller.
          </p>
        ) : (
          <div className="space-y-4">
            {similarTickets.map(similarTicket => {
              const ticketDate = similarTicket.kickoffTime ? new Date(similarTicket.kickoffTime) : null;
              const isValidDate = ticketDate && isValid(ticketDate);

              return (
                <div key={similarTicket.id} className="border-b border-betting-light-gray last:border-b-0 pb-3 last:pb-0">
                  <Link 
                    to={`/tickets/${similarTicket.id}`}
                    className="hover:text-betting-green font-medium block mb-1"
                  >
                    {similarTicket.title}
                  </Link>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isValidDate
                        ? format(ticketDate!, "MMM d, yyyy") 
                        : "Date not available"}
                    </span>
                    <span className="font-medium">
                      {similarTicket.isFree ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        <>R {similarTicket.price.toFixed(2)}</>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between mt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/sellers/${sellerId}`} className="flex items-center gap-2">
                  <span>View All Tickets</span>
                  {sellerInfo?.verified && (
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimilarTicketsCard;
