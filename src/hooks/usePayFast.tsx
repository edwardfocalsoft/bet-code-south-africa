
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { 
  fetchPaymentConfig, 
  processDirectPayment,
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
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();

  const initiatePayment = async (paymentData: PaymentData): Promise<PaymentResult | null> => {
    if (!currentUser) {
      const errorMessage = "Please log in to make a purchase";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Initiating payment for:", paymentData);
      
      // Check if user has credits to apply to this purchase
      let remainingAmount = paymentData.amount;
      let useCredit = paymentData.useCredit ?? true; // Default to using credit
      let purchaseId = paymentData.purchaseId;
      
      if (useCredit && !purchaseId) {
        // Handle credit purchase
        console.log("Attempting credit payment");
        try {
          const creditResult = await handleCreditPayment(paymentData);
          
          if (creditResult && creditResult.success && creditResult.paymentComplete) {
            console.log("Payment completed with credits");
            return creditResult;
          }
          
          purchaseId = creditResult?.purchaseId;
          console.log("Credit payment created purchase ID:", purchaseId);
        } catch (creditError: any) {
          console.error("Credit payment error:", creditError);
          toast.error("Credit payment failed", {
            description: creditError.message || "Failed to process credit payment"
          });
          // Continue with PayFast if credit payment fails
        }
      }
      
      if (!purchaseId) {
        const errorMessage = "Failed to create purchase record";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Process payment with PayFast using direct form submission
      console.log("Processing PayFast payment with purchase ID:", purchaseId);
      
      processDirectPayment({
        purchaseId: purchaseId,
        currentUser,
        amount: remainingAmount,
        itemName: paymentData.ticketTitle || "Purchase"
      });
      
      // Return a result object, but the actual redirect happens in processDirectPayment
      return {
        purchaseId,
        success: true
      };
      
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      const errorMessage = error.message || "Failed to initiate payment";
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        purchaseId: paymentData.purchaseId || "",
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPayment = async (paymentData: PaymentData): Promise<PaymentResult & { paymentComplete?: boolean } | null> => {
    try {
      // Get user's credit balance
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", currentUser!.id)
        .single();
        
      if (userError) {
        console.error("Credit balance check error:", userError);
        throw userError;
      }
      
      const creditBalance = Number(userData?.credit_balance || 0);
      console.log("User credit balance:", creditBalance, "Required amount:", paymentData.amount);
      
      // If user has enough credit, create purchase record
      if (creditBalance >= paymentData.amount) {
        console.log("Sufficient credit balance, creating purchase record");
        // Call the purchase_ticket function via RPC
        const { data, error } = await supabase.rpc(
          "purchase_ticket",
          {
            p_ticket_id: paymentData.ticketId,
            p_buyer_id: paymentData.buyerId
          }
        );
        
        if (error) {
          console.error("Purchase ticket RPC error:", error);
          throw error;
        }
        const purchaseId = data;
        console.log("Purchase record created with ID:", purchaseId);
        
        // Complete purchase using credits
        const { data: completeData, error: completeError } = await supabase.rpc(
          "complete_ticket_purchase",
          {
            p_purchase_id: purchaseId,
            p_payment_id: `credit_${Date.now()}`,
            p_payment_data: { payment_method: 'credit' }
          }
        );
        
        if (completeError) {
          console.error("Complete purchase RPC error:", completeError);
          throw completeError;
        }
        
        console.log("Credit payment completed successfully");
        
        return {
          purchaseId,
          success: true,
          paymentComplete: true
        };
      } else {
        console.log("Insufficient credit balance, continuing with PayFast");
      }
      
      // Create initial purchase record if credit is insufficient
      console.log("Creating initial purchase record for PayFast payment");
      const { data, error } = await supabase.rpc(
        "purchase_ticket",
        {
          p_ticket_id: paymentData.ticketId,
          p_buyer_id: paymentData.buyerId
        }
      );
      
      if (error) {
        console.error("Purchase ticket RPC error:", error);
        throw error;
      }
      
      return { purchaseId: data, success: true };
    } catch (error: any) {
      console.error("Credit payment error:", error);
      setError(error.message || "Credit payment error");
      throw error;
    }
  };

  const completePayment = async (purchaseId: string, paymentId: string, paymentData = {}) => {
    try {
      setLoading(true);
      setError(null);
      return await completePaymentTransaction(purchaseId, paymentId, paymentData);
    } catch (error: any) {
      console.error("Payment completion error:", error);
      const errorMessage = error.message || "Failed to complete payment";
      setError(errorMessage);
      toast.error("Payment Error", {
        description: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initiatePayment,
    completePayment
  };
};
