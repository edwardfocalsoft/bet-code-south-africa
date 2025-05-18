
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { 
  fetchPaymentConfig, 
  processWalletTopUp,
  completePaymentTransaction,
  PaymentResult 
} from "@/utils/paymentUtils";

interface TopUpData {
  amount: number;
  transactionId: string;
  cancelUrl?: string;
}

export const usePayFast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();

  // This function now only handles wallet top-ups
  const processTopUp = async (topUpData: TopUpData): Promise<PaymentResult | null> => {
    if (!currentUser) {
      const errorMessage = "Please log in to make a purchase";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Processing wallet top-up for:", topUpData);
      
      const purchaseId = topUpData.transactionId;
      
      // Process payment with PayFast using direct form submission
      console.log("Processing PayFast payment with transaction ID:", purchaseId);
      
      // This function handles the form creation and submission
      processWalletTopUp({
        purchaseId: purchaseId,
        currentUser,
        amount: topUpData.amount,
        itemName: "Wallet Credit Top-up",
        cancelUrl: topUpData.cancelUrl // Pass custom cancel URL if provided
      });
      
      // Return a result object, but the actual redirect happens in processWalletTopUp
      return {
        purchaseId,
        success: true,
        paymentComplete: false // Set to false as the payment is processed externally
      };
      
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      const errorMessage = error.message || "Failed to initiate payment";
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        purchaseId: topUpData.transactionId || "",
        success: false,
        error: errorMessage,
        paymentComplete: false
      };
    } finally {
      setLoading(false);
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
    processTopUp,
    completePayment
  };
};
