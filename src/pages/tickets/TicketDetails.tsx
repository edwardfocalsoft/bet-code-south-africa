
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useTicket } from "@/hooks/useTicket";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import TicketHeader from "@/components/tickets/details/TicketHeader";
import TicketContent from "@/components/tickets/details/TicketContent";
import TicketPurchaseDialog from "@/components/tickets/details/TicketPurchaseDialog";
import SellerInfoCard from "@/components/tickets/details/SellerInfoCard";
import SimilarTicketsCard from "@/components/tickets/details/SimilarTicketsCard";
import { PaymentResult } from "@/utils/paymentUtils";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ticket, seller, loading, error, purchaseLoading, alreadyPurchased, purchaseTicket } = useTicket(id);
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'payfast'>('credit');
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!currentUser) {
      toast.error("Please log in to purchase tickets", {
        description: "You need to be logged in to purchase tickets."
      });
      navigate("/auth/login");
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
      if (paymentMethod === 'credit') {
        // Use credit balance
        const result = await purchaseTicket();
        setPurchaseDialogOpen(false);
      } else {
        // Use PayFast
        const result = await purchaseTicket();
        
        if (result && 'testMode' in result && result.testMode) {
          toast.success("Test mode payment successful!");
          setPurchaseDialogOpen(false);
        } else if (result && 'paymentUrl' in result) {
          // Redirect to payment gateway
          window.location.href = result.paymentUrl;
        }
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error("Purchase Failed", {
        description: error.message || "There was an error processing your purchase. Please try again."
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
            <TicketContent 
              ticket={ticket}
              seller={seller}
              isSeller={isSeller}
              isPastKickoff={isPastKickoff}
              alreadyPurchased={alreadyPurchased}
              currentUser={currentUser}
              purchaseLoading={purchaseLoading}
              onPurchase={handlePurchase}
            />
          </div>

          <div>
            <SellerInfoCard seller={seller} ticket={ticket} />
            <SimilarTicketsCard ticketId={ticket.id} sellerId={ticket.seller_id} />
          </div>
        </div>
      </div>
      
      <TicketPurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        ticket={ticket}
        processingPurchase={processingPurchase}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        canAffordWithCredit={canAffordWithCredit}
        creditBalance={creditBalance}
        onConfirm={confirmPurchase}
      />
    </Layout>
  );
};

export default TicketDetails;
