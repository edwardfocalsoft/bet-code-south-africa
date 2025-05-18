
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { 
  fetchPaymentConfig, 
  generateSignature, 
  processPayment, 
  completePaymentTransaction,
  PaymentResult 
} from "@/utils/paymentUtils";

interface PaymentData {
  ticketId: string;
  ticketTitle: string;
  amount: number;
  buyerId: string;
  purchaseId?: string;
  sellerId?: string;
  useCredit?: boolean;
}

export const usePayFast = () => {
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();

  const initiatePayment = async (paymentData: PaymentData): Promise<PaymentResult | null> => {
    if (!currentUser) {
      toast.error("Please log in to make a purchase");
      return null;
    }

    try {
      setLoading(true);
      console.log("Initiating payment for:", paymentData);
      
      const config = await fetchPaymentConfig();
      
      if (!config) {
        throw new Error("Payment configuration not found");
      }
      
      console.log("Payment config retrieved:", config);

      // Check if user has credits to apply to this purchase
      let remainingAmount = paymentData.amount;
      let useCredit = paymentData.useCredit ?? true; // Default to using credit
      let purchaseId = paymentData.purchaseId;
      
      if (useCredit && !purchaseId) {
        // Handle credit purchase
        console.log("Attempting credit payment");
        const creditResult = await handleCreditPayment(paymentData);
        
        if (creditResult && creditResult.paymentComplete) {
          console.log("Payment completed with credits");
          return creditResult;
        }
        
        purchaseId = creditResult?.purchaseId;
        console.log("Credit payment created purchase ID:", purchaseId);
      }
      
      if (!purchaseId) {
        throw new Error("Failed to create purchase record");
      }
      
      // Create payment with PayFast
      console.log("Processing PayFast payment");
      const result = await processPayment({
        config,
        purchaseId: purchaseId,
        currentUser,
        amount: remainingAmount,
        ticketTitle: paymentData.ticketTitle,
        completePayment
      });
      
      console.log("PayFast payment result:", result);
      
      // Important! Redirect to payment URL if available
      if (result.paymentUrl) {
        console.log("Redirecting to payment URL:", result.paymentUrl);
        // Use direct href navigation for more reliable redirection
        window.location.href = result.paymentUrl;
      }
      
      return result;
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPayment = async (paymentData: PaymentData): Promise<PaymentResult | null> => {
    try {
      // Get user's credit balance
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", currentUser!.id)
        .single();
        
      if (userError) throw userError;
      
      const creditBalance = Number(userData?.credit_balance || 0);
      
      // If user has enough credit, create purchase record
      if (creditBalance >= paymentData.amount) {
        // Call the purchase_ticket function via RPC
        const { data, error } = await supabase.rpc(
          "purchase_ticket",
          {
            p_ticket_id: paymentData.ticketId,
            p_buyer_id: paymentData.buyerId
          }
        );
        
        if (error) throw error;
        const purchaseId = data;
        
        // Complete purchase using credits
        const { data: completeData, error: completeError } = await supabase.rpc(
          "complete_ticket_purchase",
          {
            p_purchase_id: purchaseId,
            p_payment_id: `credit_${Date.now()}`,
            p_payment_data: { payment_method: 'credit' }
          }
        );
        
        if (completeError) throw completeError;
        
        return {
          purchaseId,
          success: true,
          creditUsed: true,
          paymentComplete: true
        };
      }
      
      // Create initial purchase record if credit is insufficient
      const { data, error } = await supabase.rpc(
        "purchase_ticket",
        {
          p_ticket_id: paymentData.ticketId,
          p_buyer_id: paymentData.buyerId
        }
      );
      
      if (error) throw error;
      
      return { purchaseId: data, success: true };
    } catch (error) {
      console.error("Credit payment error:", error);
      throw error;
    }
  };

  const completePayment = async (purchaseId: string, paymentId: string, paymentData = {}) => {
    try {
      setLoading(true);
      return await completePaymentTransaction(purchaseId, paymentId, paymentData);
    } catch (error: any) {
      console.error("Payment completion error:", error);
      toast.error("Payment Error", {
        description: error.message || "Failed to complete payment"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    initiatePayment,
    completePayment
  };
};
