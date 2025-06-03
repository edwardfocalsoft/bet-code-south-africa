import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import TipButton from "@/components/sellers/TipButton";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ticket, seller, loading, error, purchaseLoading, alreadyPurchased, purchaseId, purchaseTicket, refreshTicket, purchaseError } = useTicket(id);
  const { currentUser } = useAuth();
  const { creditBalance, error: walletError } = useWallet();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePurchase = async () => {
    setLocalError(null);
    
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
      setProcessingPurchase(true);
      try {
        console.log("Processing free ticket purchase");
        const result = await purchaseTicket();
        if (result && result.success) {
          refreshTicket();
        }
      } catch (error: any) {
        console.error("Free ticket purchase error:", error);
        setLocalError(error.message || "Failed to add free ticket to your purchases");
      } finally {
        setProcessingPurchase(false);
      }
      return;
    }
    
    // Otherwise, open the purchase dialog for confirmation
    setPurchaseDialogOpen(true);
  };

  const confirmPurchase = async () => {
    if (!currentUser || !ticket) return;
    
    setProcessingPurchase(true);
    setLocalError(null);
    
    try {
      console.log("Starting purchase process with credits");
      const result = await purchaseTicket();
      console.log("Purchase result:", result);
      
      if (!result) {
        throw new Error("Purchase failed");
      }
      
      if (result.paymentComplete) {
        toast.success("Purchase successful!");
        setPurchaseDialogOpen(false);
        refreshTicket();
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setLocalError(error.message || "There was an error processing your purchase. Please try again.");
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Reset error state when dialog is closed
  useEffect(() => {
    if (!purchaseDialogOpen) {
      setLocalError(null);
    }
  }, [purchaseDialogOpen]);

  // Refresh ticket details when user logs in/out
  useEffect(() => {
    refreshTicket();
  }, [currentUser?.id, refreshTicket]);

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

        {(purchaseError || walletError || localError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {purchaseError || walletError || localError}
            </AlertDescription>
          </Alert>
        )}

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
              purchaseId={purchaseId}
            />
            
            {seller && !isSeller && currentUser && (
              <div className="mt-6 flex justify-end">
                <TipButton 
                  sellerId={seller.id}
                  sellerName={seller.username || "Seller"}
                  variant="outline"
                  size="default"
                />
              </div>
            )}
          </div>

          <div>
            <SellerInfoCard seller={seller} ticket={ticket} />
            <SimilarTicketsCard ticketId={ticket.id} sellerId={ticket.seller_id} />
          </div>
        </div>
      </div>
      
      <TicketPurchaseDialog
        isOpen={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        ticket={ticket}
        processingPurchase={processingPurchase}
        paymentMethod="credit"
        setPaymentMethod={() => {}} // No need to change payment method anymore
        canAffordWithCredit={canAffordWithCredit}
        creditBalance={creditBalance}
        onConfirm={confirmPurchase}
        error={localError || purchaseError || ""}
      />
    </Layout>
  );
};

export default TicketDetails;
