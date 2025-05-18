
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
  sellerId?: string;
  useCredit?: boolean;
}

export const usePayFast = () => {
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();

  const getPaymentConfig = async (): Promise<PayFastConfig | null> => {
    try {
      console.log("Fetching payment config");
      const { data, error } = await supabase
        .from("payment_settings")
        .select("merchant_id, merchant_key, passphrase, is_test_mode")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching payment config:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No payment configuration found");
      }
      
      console.log("Payment config fetched:", data);
      return data as PayFastConfig;
    } catch (error: any) {
      console.error("Error fetching payment config:", error);
      
      // Use fallback test mode config if can't get from database
      return {
        merchant_id: '10030614',
        merchant_key: '85onulw93ercm',
        passphrase: 'testpassphrase',
        is_test_mode: true
      };
    }
  };

  const generateSignature = (data: Record<string, string>, passphrase: string): string => {
    // In production, this would need to be done server-side for security
    // This is a client-side mock implementation for development
    const payload = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&') + `&passphrase=${passphrase}`;
    
    console.log("Signature payload:", payload);
    // Mock signature for development - this should be replaced with a proper server-side implementation
    return "DEMO_SIGNATURE_" + Math.random().toString(36).substring(2, 15);
  };

  const initiatePayment = async (paymentData: PaymentData) => {
    if (!currentUser) {
      toast.error("Please log in to make a purchase");
      return null;
    }

    try {
      setLoading(true);
      const config = await getPaymentConfig();
      
      if (!config) {
        throw new Error("Payment configuration not found");
      }

      // Check if user has credits to apply to this purchase
      let remainingAmount = paymentData.amount;
      let useCredit = paymentData.useCredit ?? true; // Default to using credit
      let purchaseId = paymentData.purchaseId;
      
      if (useCredit && !purchaseId) {
        // Get user's credit balance
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("credit_balance")
          .eq("id", currentUser.id)
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
          purchaseId = data;
          
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
        
        // Credit balance is insufficient, create purchase and proceed with payment
        // Call the purchase_ticket function via RPC to create initial record
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
        amount: remainingAmount.toFixed(2),
        item_name: `Ticket: ${paymentData.ticketTitle}`.substring(0, 100),
        item_description: "Sports betting ticket purchase"
      };

      // Add signature
      const signature = generateSignature(
        paymentParams as Record<string, string>, 
        config.passphrase
      );
      const finalParams = { ...paymentParams, signature };

      // In test mode, simulate a successful payment
      if (config.is_test_mode) {
        console.log("Test mode payment initiated");
        console.log("Payment parameters:", finalParams);
        
        // Simulate a successful payment completion
        setTimeout(async () => {
          await completePayment(purchaseId!, "SIMULATED_" + Date.now());
        }, 2000);

        return {
          purchaseId,
          success: true,
          testMode: true,
          paymentUrl: "https://sandbox.payfast.co.za/eng/process",
          formData: finalParams // Include form data for test mode too
        };
      }

      console.log("Live payment initiated with params:", finalParams);
      
      // Return payment data for actual PayFast integration
      return {
        purchaseId,
        paymentUrl: "https://www.payfast.co.za/eng/process",
        formData: finalParams,
        testMode: config.is_test_mode
      };
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
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
      
      toast.success("Purchase Complete!", {
        description: "Your purchase was successful!"
      });
      
      return true;
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
