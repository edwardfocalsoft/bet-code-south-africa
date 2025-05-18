
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// PayFast configuration interface
export interface PayFastConfig {
  merchant_id: string;
  merchant_key: string;
  passphrase: string;
  is_test_mode: boolean;
}

// Always return hardcoded credentials for reliability
export const fetchPaymentConfig = async (): Promise<PayFastConfig> => {
  console.log("Using hardcoded payment configuration");
  return {
    merchant_id: '14452088',
    merchant_key: '3indglm6c7jzr',
    passphrase: 'AfrinetHash2025',
    is_test_mode: false // Production mode
  };
};

// Define proper return types for payment processing
export interface PaymentResult {
  purchaseId: string;
  success: boolean;
  error?: string;
}

interface ProcessPaymentParams {
  purchaseId: string;
  currentUser: any;
  amount: number;
  itemName: string;
  returnUrl?: string;
  cancelUrl?: string;
}

// Simplified payment processing function that creates and submits a form
export const processDirectPayment = (params: ProcessPaymentParams): void => {
  try {
    const { purchaseId, currentUser, amount, itemName } = params;
    
    // Essential PayFast parameters
    const paymentData = {
      merchant_id: '14452088',
      merchant_key: '3indglm6c7jzr',
      return_url: params.returnUrl || `${window.location.origin}/payment/success`,
      cancel_url: params.cancelUrl || `${window.location.origin}/payment/cancel`,
      notify_url: `${window.location.origin}/api/payment-notification`,
      email_address: currentUser.email || "",
      m_payment_id: purchaseId,
      amount: amount.toFixed(2),
      item_name: itemName.substring(0, 100),
      name_first: currentUser.username || "User"
    };

    console.log("Submitting payment with data:", paymentData);
    
    // Create the form element
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.payfast.co.za/eng/process";
    form.target = "_self";
    
    // Add form fields
    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });
    
    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();
    
  } catch (error: any) {
    console.error("Payment form submission error:", error);
    toast.error("Payment error", {
      description: error.message || "Could not process payment"
    });
    throw error;
  }
};

export const completePaymentTransaction = async (
  purchaseId: string, 
  paymentId: string, 
  paymentData = {}
) => {
  try {
    console.log(`Completing transaction for purchase ID: ${purchaseId}`);
    
    // Call the complete_ticket_purchase function
    const { data, error } = await supabase.rpc(
      "complete_ticket_purchase",
      {
        p_purchase_id: purchaseId,
        p_payment_id: paymentId,
        p_payment_data: paymentData
      }
    );
    
    if (error) {
      console.error("Supabase RPC error:", error);
      toast.error("Payment completion error", {
        description: `Database error: ${error.message}`
      });
      throw error;
    }
    
    console.log("Payment completion success:", data);
    
    toast.success("Purchase Complete!", {
      description: "Your purchase was successful!"
    });
    
    return true;
  } catch (error: any) {
    console.error("Payment completion error:", error);
    toast.error("Payment completion error", {
      description: error.message || "Failed to complete payment in database"
    });
    throw error;
  }
};
