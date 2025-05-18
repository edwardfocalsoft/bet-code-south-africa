
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { usePayFast } from "./usePayFast";
import { toast } from "sonner";
import { PaymentResult } from "@/utils/paymentUtils";

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
        } else {
          setAlreadyPurchased(false);
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
      return null;
    }
    
    if (alreadyPurchased) {
      toast.error("You have already purchased this ticket");
      return null;
    }

    if (!ticket) {
      toast.error("Ticket information not available");
      return null;
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
        return { purchaseId: purchaseData, success: true, paymentComplete: true };
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
        return { purchaseId: purchaseData, success: true, creditUsed: true, paymentComplete: true };
      }
      
      // User needs to pay with PayFast
      const result = await initiatePayment({
        ticketId: ticketId || "",
        ticketTitle: ticket.title,
        amount: ticket.price,
        buyerId: currentUser.id,
        sellerId: ticket.seller_id
      });
      
      // Mark as purchased if payment was completed
      if (result && result.paymentComplete) {
        setAlreadyPurchased(true);
      }
      
      return result;

    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to purchase ticket");
      return null;
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
