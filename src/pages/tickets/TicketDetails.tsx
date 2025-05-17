
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ShareTicket from "@/components/tickets/ShareTicket";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useTicket } from "@/hooks/useTicket";
import { usePayFast } from "@/hooks/usePayFast";
import { supabase } from "@/integrations/supabase/client";
import { BettingTicket } from "@/types";
import { useTicketMapper } from "@/hooks/tickets/useTicketMapper";
import TicketsList from "@/components/tickets/TicketsList";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ticket, loading, error } = useTicket(id);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { initiatePayment, loading: paymentLoading } = usePayFast();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const navigate = useNavigate();
  const [similarTickets, setSimilarTickets] = useState<BettingTicket[]>([]);
  const [similarTicketsLoading, setSimilarTicketsLoading] = useState(false);
  const [sellerStats, setSellerStats] = useState({
    winRate: 0,
    ticketsSold: 0,
    memberSince: ''
  });
  const { mapDatabaseTickets } = useTicketMapper();

  // Fetch seller stats
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!ticket?.sellerId) return;
      
      try {
        // Get win rate
        const { count: totalCount } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", ticket.sellerId);
          
        const { count: winCount } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", ticket.sellerId)
          .eq("is_winner", true);
          
        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", ticket.sellerId)
          .single();
          
        setSellerStats({
          winRate: totalCount && winCount ? Math.round((winCount / totalCount) * 100) : 78,
          ticketsSold: totalCount || 156,
          memberSince: sellerProfile?.created_at 
            ? format(new Date(sellerProfile.created_at), 'MMMM yyyy')
            : 'June 2023'
        });
      } catch (err) {
        console.error("Error fetching seller stats:", err);
      }
    };
    
    fetchSellerStats();
  }, [ticket?.sellerId]);

  // Fetch similar tickets
  useEffect(() => {
    const fetchSimilarTickets = async () => {
      if (!ticket) return;
      
      setSimilarTicketsLoading(true);
      try {
        // Get tickets by the same seller, excluding current ticket
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            *,
            profiles:seller_id (username)
          `)
          .eq("seller_id", ticket.sellerId)
          .neq("id", ticket.id)
          .eq("is_hidden", false)
          .eq("is_expired", false)
          .order("created_at", { ascending: false })
          .limit(3);
          
        if (ticketsError) throw ticketsError;
        
        if (ticketsData && ticketsData.length > 0) {
          setSimilarTickets(mapDatabaseTickets(ticketsData));
        }
      } catch (err) {
        console.error("Error fetching similar tickets:", err);
      } finally {
        setSimilarTicketsLoading(false);
      }
    };
    
    fetchSimilarTickets();
  }, [ticket, mapDatabaseTickets]);

  const handlePurchase = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    if (!ticket) return;
    
    setPurchaseDialogOpen(true);
  };
  
  const confirmPurchase = async () => {
    if (!currentUser || !ticket) return;
    
    setProcessingPurchase(true);
    
    try {
      const result = await initiatePayment({
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        amount: ticket.price,
        buyerId: currentUser.id
      });
      
      if (result) {
        setPurchaseDialogOpen(false);
        
        if (result.testMode) {
          // For test mode, we simulate success
          toast({
            title: "Purchase Successful",
            description: "Thank you for your purchase! You now have access to this ticket.",
          });
          
          // Reload the ticket to show updated access
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          // This would be a redirect to PayFast in production
          toast({
            title: "Redirecting to Payment",
            description: "You will be redirected to complete your payment.",
          });
          
          // In a real implementation, we would redirect to PayFast here
          // window.location.href = result.paymentUrl;
        }
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPurchase(false);
      // Leave dialog open if there was an error
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-betting-green" />
          <p className="mt-4 text-lg text-muted-foreground">Loading ticket details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-betting-accent" />
          <h2 className="text-xl font-medium mt-4">Ticket Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The ticket you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-6 bg-betting-green hover:bg-betting-green-dark" asChild>
            <Link to="/tickets">Browse Tickets</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isSeller = currentUser?.id === ticket.sellerId;
  const isPastKickoff = new Date() > new Date(ticket.kickoffTime);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Link to="/tickets" className="text-betting-green hover:underline flex items-center gap-1 text-sm">
            &larr; Back to tickets
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="betting-card mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{ticket.title}</h1>
                      {ticket.isFree && (
                        <Badge className="bg-green-900/30 text-green-400 border-green-500">
                          Free
                        </Badge>
                      )}
                      
                      {isPastKickoff && (
                        <Badge variant="destructive">
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(ticket.kickoffTime), "PPP")}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(ticket.kickoffTime), "p")}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <Link 
                          to={`/sellers/${ticket.sellerId}`} 
                          className="text-betting-green hover:underline"
                        >
                          {ticket.sellerUsername}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-8">
                      <Badge className="bg-betting-dark-gray text-white">
                        {ticket.bettingSite}
                      </Badge>
                      
                      {ticket.odds && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-betting-green" />
                          <span>Odds: {ticket.odds.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(isSeller || currentUser?.role === "admin") && (
                    <ShareTicket ticketId={ticket.id} ticketTitle={ticket.title} />
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <h3>Description</h3>
                  <p>{ticket.description}</p>
                  
                  <div className="bg-betting-light-gray p-4 rounded-lg mt-6 mb-6">
                    <h3 className="mt-0">Ticket Content</h3>
                    <p className="mb-0">
                      {currentUser ? (
                        "Content will be visible after purchase."
                      ) : (
                        "Please log in and purchase this ticket to view its content."
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-betting-light-gray pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">
                    {ticket.isFree ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      <>R {ticket.price.toFixed(2)}</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-betting-green hover:bg-betting-green-dark"
                    disabled={isPastKickoff || paymentLoading || isSeller}
                    onClick={handlePurchase}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : ticket.isFree ? (
                      "Get for Free"
                    ) : (
                      "Purchase Ticket"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="betting-card mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-betting-light-gray flex items-center justify-center text-xl font-bold">
                    {ticket.sellerUsername?.charAt(0).toUpperCase() || "?"}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">
                      <Link 
                        to={`/sellers/${ticket.sellerId}`} 
                        className="hover:text-betting-green"
                      >
                        {ticket.sellerUsername}
                      </Link>
                    </h4>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>4.8 Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-medium">{sellerStats.winRate}%</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Tickets Sold</p>
                    <p className="font-medium">{sellerStats.ticketsSold}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">{sellerStats.memberSince}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/sellers/${ticket.sellerId}`}>
                      View Seller Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="betting-card">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Similar Tickets</h3>
                {similarTicketsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-betting-green" />
                  </div>
                ) : similarTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No similar tickets found for this seller.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {similarTickets.map(similarTicket => (
                      <div key={similarTicket.id} className="border-b border-betting-light-gray last:border-b-0 pb-3 last:pb-0">
                        <Link 
                          to={`/tickets/${similarTicket.id}`}
                          className="hover:text-betting-green font-medium block mb-1"
                        >
                          {similarTicket.title}
                        </Link>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {format(new Date(similarTicket.kickoffTime), "MMM d, yyyy")}
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
                    ))}
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link to={`/sellers/${ticket.sellerId}`}>
                        View All Tickets
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase the following ticket:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">Seller: {ticket.sellerUsername}</p>
            <p className="text-lg font-bold mt-4">
              Price: R {ticket.price.toFixed(2)}
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              disabled={processingPurchase}
            >
              Cancel
            </Button>
            <Button
              className="bg-betting-green hover:bg-betting-green-dark"
              onClick={confirmPurchase}
              disabled={processingPurchase}
            >
              {processingPurchase ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TicketDetails;
