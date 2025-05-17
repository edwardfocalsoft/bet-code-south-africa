
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { usePayFast } from "./usePayFast";
import { toast } from "sonner";

export const useTicket = (ticketId: string | undefined) => {
  const [ticket, setTicket] = useState<any | null>(null);
  const [seller, setSeller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();
  const { initiatePayment } = usePayFast();
  const { toast: uiToast } = useToast();

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get ticket details
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles:seller_id (
            username,
            avatar_url,
            id
          )
        `)
        .eq("id", ticketId)
        .single();

      if (ticketError) throw ticketError;
      
      setTicket(ticketData);
      setSeller(ticketData.profiles);
      
      // Check if the current user has already purchased this ticket
      if (currentUser?.id) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .select("id")
          .eq("ticket_id", ticketId)
          .eq("buyer_id", currentUser.id)
          .maybeSingle();
          
        if (!purchaseError && purchaseData) {
          setAlreadyPurchased(true);
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching ticket:", error);
      setError(error);
      uiToast({
        title: "Error",
        description: error.message || "Failed to load ticket details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [ticketId, currentUser?.id, uiToast]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const purchaseTicket = async () => {
    if (!currentUser) {
      toast.error("Please log in to purchase this ticket");
      return;
    }
    
    if (alreadyPurchased) {
      toast.error("You have already purchased this ticket");
      return;
    }

    if (!ticket) {
      toast.error("Ticket information not available");
      return;
    }

    try {
      setPurchaseLoading(true);

      // Get user's current credit balance
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", currentUser.id)
        .single();

      if (userError) throw userError;
      
      const creditBalance = Number(userData?.credit_balance || 0);
      const ticketPrice = Number(ticket.price || 0);
      
      // For free tickets, just create the purchase record
      if (ticket.is_free) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticketId,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) throw purchaseError;
        
        toast.success("Free ticket added to your purchases!");
        setAlreadyPurchased(true);
        return;
      }
      
      // If user has enough credits, use them
      if (creditBalance >= ticketPrice) {
        // First create a purchase record
        const { data: purchaseData, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticketId,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) throw purchaseError;
        
        // Complete the purchase using credits
        const { data: completeData, error: completeError } = await supabase
          .rpc('complete_ticket_purchase', {
            p_purchase_id: purchaseData,
            p_payment_id: `credit_${Date.now()}`,
            p_payment_data: { payment_method: 'credit' }
          });
        
        if (completeError) throw completeError;

        toast.success("Ticket purchased using your credit balance!");
        setAlreadyPurchased(true);
        return;
      }
      
      // User needs to pay with PayFast
      // For now, initiate payment for the full amount, we'll update this later
      const result = await initiatePayment({
        ticketId: ticketId || "",
        ticketTitle: ticket.title,
        amount: ticket.price,
        buyerId: currentUser.id,
        sellerId: ticket.seller_id
      });

      if (result && result.paymentUrl) {
        // Redirect to payment page
        window.location.href = result.paymentUrl;
      } else if (result && result.testMode) {
        toast.success("Test mode payment successful!");
        setAlreadyPurchased(true);
      }

    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to purchase ticket");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return {
    ticket,
    seller,
    loading,
    purchaseLoading,
    alreadyPurchased,
    error,
    purchaseTicket,
    refreshTicket: fetchTicketDetails
  };
};
