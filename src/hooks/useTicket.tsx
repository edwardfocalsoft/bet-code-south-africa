
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
  const { currentUser } = useAuth();
  const { generatePaymentUrl } = usePayFast();
  const { toast: uiToast } = useToast();

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      
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

    try {
      setPurchaseLoading(true);

      // Step 1: Call the purchase_ticket function to create the purchase record and reserve the ticket
      const { data: purchaseData, error: purchaseError } = await supabase
        .rpc('purchase_ticket', {
          p_ticket_id: ticketId,
          p_buyer_id: currentUser.id
        });

      if (purchaseError) throw purchaseError;
      
      if (!purchaseData) {
        throw new Error("Failed to process purchase");
      }

      const purchaseId = purchaseData;

      // If the ticket is free, we're done
      if (ticket.is_free) {
        toast.success("Free ticket added to your purchases!");
        setAlreadyPurchased(true);
        return;
      }

      // For paid tickets, redirect to PayFast
      const paymentUrl = await generatePaymentUrl({
        amount: ticket.price,
        item_name: ticket.title,
        purchaseId: purchaseId,
        buyerId: currentUser.id,
        sellerId: ticket.seller_id
      });

      // Redirect to payment page
      window.location.href = paymentUrl;

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
    purchaseTicket,
    refreshTicket: fetchTicketDetails
  };
};
