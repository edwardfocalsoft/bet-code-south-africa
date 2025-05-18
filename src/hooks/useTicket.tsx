
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
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
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

      if (ticketError) {
        console.error("Ticket fetch error:", ticketError);
        throw ticketError;
      }
      
      setTicket(ticketData);
      setSeller(ticketData.profiles);
      console.log("Ticket details fetched:", ticketData);
      
      // Check if the current user has already purchased this ticket
      if (currentUser?.id) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .select("id, payment_status")
          .eq("ticket_id", ticketId)
          .eq("buyer_id", currentUser.id)
          .maybeSingle();
          
        if (purchaseError) {
          console.error("Purchase check error:", purchaseError);
        }
        
        if (purchaseData && purchaseData.payment_status === 'completed') {
          console.log("User has already purchased this ticket:", purchaseData);
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

  const purchaseTicket = async (useCredit = true) => {
    setPurchaseError(null);
    
    if (!currentUser) {
      const errorMessage = "Please log in to purchase this ticket";
      setPurchaseError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
    
    if (alreadyPurchased) {
      const errorMessage = "You have already purchased this ticket";
      setPurchaseError(errorMessage);
      toast.error(errorMessage);
      return null;
    }

    if (!ticket) {
      const errorMessage = "Ticket information not available";
      setPurchaseError(errorMessage);
      toast.error(errorMessage);
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

      if (userError) {
        console.error("Credit balance check error:", userError);
        throw userError;
      }
      
      const creditBalance = Number(userData?.credit_balance || 0);
      const ticketPrice = Number(ticket.price || 0);
      
      console.log("User credit balance:", creditBalance, "Ticket price:", ticketPrice);
      
      // For free tickets, just create the purchase record
      if (ticket.is_free) {
        console.log("Processing free ticket");
        const { data: purchaseData, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticketId,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) {
          console.error("Free ticket purchase error:", purchaseError);
          throw purchaseError;
        }
        
        console.log("Free ticket purchase successful:", purchaseData);
        toast.success("Free ticket added to your purchases!");
        setAlreadyPurchased(true);
        return { purchaseId: purchaseData, success: true, paymentComplete: true };
      }
      
      // If user has enough credits and wants to use them, use credits
      if (useCredit && creditBalance >= ticketPrice) {
        console.log("Using credit balance to purchase ticket");
        // First create a purchase record
        const { data: purchaseData, error: purchaseError } = await supabase
          .rpc('purchase_ticket', {
            p_ticket_id: ticketId,
            p_buyer_id: currentUser.id
          });

        if (purchaseError) {
          console.error("Ticket purchase error:", purchaseError);
          throw purchaseError;
        }
        
        console.log("Purchase record created with ID:", purchaseData);
        
        // Complete the purchase using credits
        const { data: completeData, error: completeError } = await supabase
          .rpc('complete_ticket_purchase', {
            p_purchase_id: purchaseData,
            p_payment_id: `credit_${Date.now()}`,
            p_payment_data: { payment_method: 'credit' }
          });
        
        if (completeError) {
          console.error("Complete purchase error:", completeError);
          throw completeError;
        }
        
        console.log("Credit purchase completed successfully");
        toast.success("Ticket purchased using your credit balance!");
        setAlreadyPurchased(true);
        return { purchaseId: purchaseData, success: true, creditUsed: true, paymentComplete: true };
      }
      
      // User wants to pay with PayFast
      console.log("Initiating PayFast payment for ticket");
      const result = await initiatePayment({
        ticketId: ticketId || "",
        ticketTitle: ticket.title,
        amount: ticket.price,
        buyerId: currentUser.id,
        sellerId: ticket.seller_id,
        useCredit: useCredit // Pass the useCredit flag
      });
      
      // Mark as purchased if payment was completed
      if (result && result.paymentComplete) {
        setAlreadyPurchased(true);
      }
      
      return result;

    } catch (error: any) {
      console.error("Purchase error:", error);
      const errorMessage = error.message || "Failed to purchase ticket";
      setPurchaseError(errorMessage);
      toast.error(errorMessage);
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
    purchaseError,
    purchaseTicket,
    refreshTicket: fetchTicketDetails
  };
};
