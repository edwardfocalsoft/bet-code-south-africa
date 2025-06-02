
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useTicket } from "@/hooks/useTicket";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, DollarSign, Star, Calendar, MapPin, Trophy, AlertCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TicketPurchaseDialog from "@/components/tickets/details/TicketPurchaseDialog";
import { usePayFast } from "@/hooks/usePayFast";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { ticket, loading } = useTicket(id!);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const { initiatePayment } = usePayFast();

  // Get user's credit balance
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  const creditBalance = userProfile?.credit_balance || 0;
  const canAffordWithCredit = creditBalance >= (ticket?.price || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (ticket: any) => {
    const now = new Date();
    const kickoffTime = new Date(ticket.kickoff_time);
    
    if (ticket.is_expired || kickoffTime < now) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    return <Badge className="bg-betting-green text-white">Active</Badge>;
  };

  const handlePurchase = () => {
    if (!currentUser) {
      toast.error("Please login to purchase tickets");
      return;
    }
    
    setPurchaseError("");
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!ticket || !currentUser) return;

    setProcessingPurchase(true);
    setPurchaseError("");

    try {
      if (paymentMethod === "credit") {
        // Handle credit purchase
        const { data: purchaseId, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticket.id,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) throw purchaseError;

        if (ticket.is_free) {
          toast.success("Free ticket obtained successfully!");
        } else {
          // Complete the purchase for credit payment
          const { data: completed, error: completeError } = await supabase
            .rpc('complete_ticket_purchase', {
              p_purchase_id: purchaseId,
              p_payment_id: `credit_${Date.now()}`,
              p_payment_data: { method: 'credit' }
            });

          if (completeError) throw completeError;
          toast.success("Ticket purchased successfully with credits!");
        }
        
        setShowPurchaseDialog(false);
      } else {
        // Handle PayFast payment
        const { data: purchaseId, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticket.id,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) throw purchaseError;

        // Initiate PayFast payment
        await initiatePayment({
          amount: ticket.price,
          itemName: `Ticket: ${ticket.title}`,
          customStr1: purchaseId,
          successUrl: `/payment/success?purchase_id=${purchaseId}`,
          cancelUrl: `/tickets/${ticket.id}?payment=cancelled`
        });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message || "Purchase failed. Please try again.");
      toast.error("Purchase failed. Please try again.");
    } finally {
      setProcessingPurchase(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-betting-green"></div>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Ticket Not Found</h2>
              <p className="text-muted-foreground">The ticket you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const timeToKickoff = formatDistance(new Date(ticket.kickoff_time), new Date(), { addSuffix: true });
  const isExpired = new Date(ticket.kickoff_time) < new Date() || ticket.is_expired;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                    <CardDescription className="text-lg">{ticket.description}</CardDescription>
                  </div>
                  {getStatusBadge(ticket)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{formatDate(ticket.kickoff_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{timeToKickoff}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{ticket.betting_site}</span>
                  </div>
                  {ticket.odds && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                      <span>Odds: {ticket.odds}</span>
                    </div>
                  )}
                </div>

                {ticket.event_results && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Event Results</h4>
                    <p>{ticket.event_results}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-betting-green mb-4">
                  {ticket.is_free ? "FREE" : formatCurrency(ticket.price)}
                </div>
                {!isExpired && (
                  <Button 
                    onClick={handlePurchase}
                    className="w-full bg-betting-green hover:bg-betting-green-dark"
                    disabled={processingPurchase}
                  >
                    {ticket.is_free ? "Get Free Ticket" : "Purchase Ticket"}
                  </Button>
                )}
                {isExpired && (
                  <Button disabled className="w-full">
                    Ticket Expired
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-betting-green rounded-full flex items-center justify-center text-white font-semibold">
                    {ticket.seller?.username?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold">{ticket.seller?.username || 'Anonymous Seller'}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">4.8 (124 reviews)</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Seller Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <TicketPurchaseDialog
          isOpen={showPurchaseDialog}
          onClose={() => setShowPurchaseDialog(false)}
          ticket={ticket}
          processingPurchase={processingPurchase}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          canAffordWithCredit={canAffordWithCredit}
          creditBalance={creditBalance}
          onConfirm={handleConfirmPurchase}
          error={purchaseError}
        />
      </div>
    </Layout>
  );
};

export default TicketDetails;
