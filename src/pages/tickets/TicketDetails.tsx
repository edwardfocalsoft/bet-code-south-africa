
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
import { formatDistanceToNow, format, isValid } from "date-fns";
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
import { useWallet } from "@/hooks/useWallet";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ticket, seller, loading, error, purchaseLoading, alreadyPurchased, purchaseTicket } = useTicket(id);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { initiatePayment, loading: paymentLoading } = usePayFast();
  const { creditBalance } = useWallet();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'payfast'>('credit');
  const navigate = useNavigate();
  const [similarTickets, setSimilarTickets] = useState<BettingTicket[]>([]);
  const [similarTicketsLoading, setSimilarTicketsLoading] = useState(false);
  const [sellerStats, setSellerStats] = useState({
    winRate: 0,
    ticketsSold: 0,
    memberSince: ''
  });
  const { mapDatabaseTickets } = useTicketMapper();

  // Helper function to safely format dates
  const safeFormat = (date: string | Date | null | undefined, formatStr: string, fallback: string = 'N/A') => {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return fallback;
    
    try {
      return format(dateObj, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return fallback;
    }
  };

  // Fetch seller stats
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!ticket?.seller_id) return;
      
      try {
        // Get win rate
        const { count: totalCount } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", ticket.seller_id);
          
        const { count: winCount } = await supabase
          .from("purchases")
          .select("*", { count: 'exact', head: true })
          .eq("seller_id", ticket.seller_id)
          .eq("is_winner", true);
          
        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", ticket.seller_id)
          .single();
          
        setSellerStats({
          winRate: totalCount && winCount ? Math.round((winCount / totalCount) * 100) : 78,
          ticketsSold: totalCount || 156,
          memberSince: sellerProfile?.created_at 
            ? safeFormat(sellerProfile.created_at, 'MMMM yyyy', 'June 2023')
            : 'June 2023'
        });
      } catch (err) {
        console.error("Error fetching seller stats:", err);
      }
    };
    
    fetchSellerStats();
  }, [ticket?.seller_id]);

  // Fetch similar tickets
  useEffect(() => {
    const fetchSimilarTickets = async () => {
      if (!ticket || !ticket.seller_id) return;
      
      setSimilarTicketsLoading(true);
      try {
        // Get tickets by the same seller, excluding current ticket
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            *,
            profiles:seller_id (username)
          `)
          .eq("seller_id", ticket.seller_id)
          .neq("id", id)
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
  }, [ticket, id, mapDatabaseTickets]);

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
    
    // Check if it's a free ticket
    if (ticket.is_free) {
      await purchaseTicket();
      return;
    }
    
    // Otherwise, open the purchase dialog
    setPurchaseDialogOpen(true);
    
    // Default to credit if there's enough balance
    if (creditBalance >= ticket.price) {
      setPaymentMethod('credit');
    } else {
      setPaymentMethod('payfast');
    }
  };
  
  const confirmPurchase = async () => {
    if (!currentUser || !ticket) return;
    
    setProcessingPurchase(true);
    
    try {
      await purchaseTicket();
      setPurchaseDialogOpen(false);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPurchase(false);
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

  const isSeller = currentUser?.id === ticket.seller_id;
  const isPastKickoff = new Date() > new Date(ticket.kickoff_time || Date.now());
  const canAffordWithCredit = creditBalance >= ticket.price;

  // Make sure the date is valid before trying to format it
  const kickoffTime = ticket.kickoff_time ? new Date(ticket.kickoff_time) : new Date();
  const isValidKickoffTime = isValid(kickoffTime);

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
                      {ticket.is_free && (
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
                      {isValidKickoffTime && (
                        <>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{safeFormat(kickoffTime, "PPP")}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{safeFormat(kickoffTime, "p")}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <Link 
                          to={`/sellers/${ticket.seller_id}`} 
                          className="text-betting-green hover:underline"
                        >
                          {ticket.profiles?.username || "Unknown Seller"}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-8">
                      <Badge className="bg-betting-dark-gray text-white">
                        {ticket.betting_site}
                      </Badge>
                      
                      {ticket.odds && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-betting-green" />
                          <span>Odds: {Number(ticket.odds).toFixed(2)}</span>
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
                        alreadyPurchased ? ticket.ticket_code : "Content will be visible after purchase."
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
                    {ticket.is_free ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      <>R {Number(ticket.price).toFixed(2)}</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-betting-green hover:bg-betting-green-dark"
                    disabled={isPastKickoff || purchaseLoading || isSeller || alreadyPurchased}
                    onClick={handlePurchase}
                  >
                    {purchaseLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : alreadyPurchased ? (
                      "Purchased"
                    ) : ticket.is_free ? (
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
                    {ticket.profiles?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">
                      <Link 
                        to={`/sellers/${ticket.seller_id}`} 
                        className="hover:text-betting-green"
                      >
                        {ticket.profiles?.username || "Unknown Seller"}
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
                    <Link to={`/sellers/${ticket.seller_id}`}>
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
                    {similarTickets.map(similarTicket => {
                      const ticketDate = new Date(similarTicket.kickoffTime);
                      const isValidDate = isValid(ticketDate);

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
                                ? format(ticketDate, "MMM d, yyyy") 
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
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link to={`/sellers/${ticket.seller_id}`}>
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
            <p className="text-sm text-muted-foreground">Seller: {ticket.profiles?.username || "Unknown Seller"}</p>
            <p className="text-lg font-bold mt-4">
              Price: R {Number(ticket.price).toFixed(2)}
            </p>
            
            {/* Payment method selection */}
            {!ticket.is_free && (
              <div className="mt-6 border-t border-betting-light-gray pt-4">
                <h4 className="text-sm font-medium mb-3">Payment Method</h4>
                
                <div className="space-y-3">
                  {/* Credit balance option */}
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer ${
                      paymentMethod === 'credit' 
                        ? 'border-betting-green bg-betting-green/10' 
                        : 'border-betting-light-gray'
                    }`}
                    onClick={() => canAffordWithCredit && setPaymentMethod('credit')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center">
                          {paymentMethod === 'credit' && (
                            <div className="h-2 w-2 rounded-full bg-betting-green" />
                          )}
                        </div>
                        <span>Wallet Credit</span>
                      </div>
                      <span className={`text-sm ${canAffordWithCredit ? 'text-green-400' : 'text-red-400'}`}>
                        R {creditBalance.toFixed(2)} available
                      </span>
                    </div>
                    
                    {!canAffordWithCredit && (
                      <p className="text-xs text-red-400 mt-1">
                        Insufficient credit balance
                      </p>
                    )}
                  </div>
                  
                  {/* PayFast option */}
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer ${
                      paymentMethod === 'payfast' 
                        ? 'border-betting-green bg-betting-green/10' 
                        : 'border-betting-light-gray'
                    }`}
                    onClick={() => setPaymentMethod('payfast')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center">
                        {paymentMethod === 'payfast' && (
                          <div className="h-2 w-2 rounded-full bg-betting-green" />
                        )}
                      </div>
                      <span>PayFast</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={processingPurchase || (!canAffordWithCredit && paymentMethod === 'credit')}
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
