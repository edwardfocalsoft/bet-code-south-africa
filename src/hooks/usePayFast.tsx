
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface PayFastConfig {
  merchant_id: string;
  merchant_key: string;
  passphrase: string;
  is_test_mode: boolean;
}

interface PaymentData {
  ticketId: string;
  ticketTitle: string;
  amount: number;
  buyerId: string;
  purchaseId?: string;
}

export const usePayFast = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const getPaymentConfig = async (): Promise<PayFastConfig | null> => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("merchant_id, merchant_key, passphrase, is_test_mode")
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching payment config:", error);
      return null;
    }
  };

  const generateSignature = (data: Record<string, string>, passphrase: string): string => {
    // In production, this would need to be done server-side for security
    // For now, we'll implement a simple client-side version for demonstration
    const values = Object.values(data);
    values.push(passphrase);
    
    // This is a placeholder - in production use a proper hashing function
    // via an edge function or other secure method
    return "DEMO_SIGNATURE_" + Math.random().toString(36).substring(2, 15);
  };

  const initiatePayment = async (paymentData: PaymentData) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      const config = await getPaymentConfig();
      
      if (!config) {
        throw new Error("Payment configuration not found");
      }

      // First, create a pending purchase record
      let purchaseId = paymentData.purchaseId;
      
      if (!purchaseId) {
        // Call the purchase_ticket function via RPC
        const { data, error } = await supabase.rpc(
          "purchase_ticket",
          {
            p_ticket_id: paymentData.ticketId,
            p_buyer_id: paymentData.buyerId
          }
        );
        
        if (error) throw error;
        purchaseId = data;
      }

      // Create PayFast payment data
      const paymentParams = {
        merchant_id: config.merchant_id,
        merchant_key: config.merchant_key,
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payment-notification`,
        name_first: currentUser.username || "User",
        email_address: currentUser.email || "",
        m_payment_id: purchaseId,
        amount: paymentData.amount.toFixed(2),
        item_name: `Ticket: ${paymentData.ticketTitle}`.substring(0, 100),
        item_description: "Sports betting ticket purchase"
      };

      // Add signature
      const signature = generateSignature(
        paymentParams as Record<string, string>, 
        config.passphrase
      );
      const finalParams = { ...paymentParams, signature };

      // Construct the form data for submission
      const formData = new FormData();
      Object.entries(finalParams).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // In test mode, simulate a successful payment
      if (config.is_test_mode) {
        // Simulate a successful payment completion
        setTimeout(async () => {
          await completePayment(purchaseId!, "SIMULATED_" + Date.now());
        }, 2000);

        return {
          purchaseId,
          success: true,
          testMode: true
        };
      }

      // Return payment data - in a real implementation, 
      // this would be submitted to PayFast
      return {
        purchaseId,
        paymentUrl: "https://sandbox.payfast.co.za/eng/process",
        formData: finalParams,
        testMode: config.is_test_mode
      };
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async (purchaseId: string, paymentId: string, paymentData = {}) => {
    try {
      setLoading(true);
      
      // Call the complete_ticket_purchase function
      const { data, error } = await supabase.rpc(
        "complete_ticket_purchase",
        {
          p_purchase_id: purchaseId,
          p_payment_id: paymentId,
          p_payment_data: paymentData
        }
      );
      
      if (error) throw error;
      
      toast({
        title: "Purchase Complete",
        description: "Your purchase was successful!",
      });
      
      return true;
    } catch (error: any) {
      console.error("Payment completion error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to complete payment",
        variant: "destructive",
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
