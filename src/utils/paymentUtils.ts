
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayFastConfig {
  merchant_id: string;
  merchant_key: string;
  passphrase: string;
  is_test_mode: boolean;
}

export const fetchPaymentConfig = async (): Promise<PayFastConfig | null> => {
  try {
    // Always use the hardcoded credentials for reliability
    console.log("Using hardcoded payment configuration");
    return {
      merchant_id: '14452088',
      merchant_key: '3indglm6c7jzr',
      passphrase: 'AfrinetHash2025',
      is_test_mode: false // Set to false for production mode
    };
  } catch (error: any) {
    console.error("Error with payment config:", error);
    toast.error("Payment configuration error", {
      description: error.message || "Could not load payment configuration"
    });
    
    // Still return the hardcoded config as a fallback
    return {
      merchant_id: '14452088',
      merchant_key: '3indglm6c7jzr',
      passphrase: 'AfrinetHash2025',
      is_test_mode: false // Set to false for production mode
    };
  }
};

export const generateSignature = (data: Record<string, string>, passphrase: string): string => {
  // For proper implementation on client side, we'll use a concatenated string
  // In production, this should be calculated server-side with proper MD5 hashing
  const payload = Object.keys(data)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&') + `&passphrase=${encodeURIComponent(passphrase)}`;
  
  console.log("Preparing signature payload for:", payload);
  
  // Since we can't generate a proper MD5 hash on the client side
  // This is a placeholder - in production use server-side generation
  return "CLIENT_SIDE_SIGNATURE";
};

// Define proper return types for payment processing
export interface PaymentResult {
  purchaseId: string;
  success: boolean;
  testMode?: boolean;
  creditUsed?: boolean;
  paymentComplete?: boolean;
  paymentUrl?: string;
  formData?: Record<string, string>;
  error?: string;
}

interface ProcessPaymentParams {
  config: PayFastConfig;
  purchaseId: string;
  currentUser: any;
  amount: number;
  ticketTitle: string;
  completePayment: (purchaseId: string, paymentId: string, paymentData?: any) => Promise<boolean>;
}

export const processPayment = async ({
  config,
  purchaseId,
  currentUser,
  amount,
  ticketTitle,
  completePayment
}: ProcessPaymentParams): Promise<PaymentResult> => {
  try {
    console.log("Processing payment with config:", config);
    
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
      amount: amount.toFixed(2),
      item_name: `${ticketTitle}`.substring(0, 100),
      item_description: "Sports betting ticket purchase"
    };

    console.log("Payment params:", paymentParams);

    // Build the PayFast URL - use production URL
    const baseUrl = 'https://www.payfast.co.za/eng/process';
    
    // Create a form element and submit it programmatically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = baseUrl;
    form.target = '_self'; // Load in the same window
    
    // Add all parameters as hidden form inputs
    for (const [key, value] of Object.entries(paymentParams)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
    
    // Add the form to the body and submit it immediately
    document.body.appendChild(form);
    console.log("Submitting form to PayFast:", baseUrl);
    
    // Return successful result before submitting form
    const result = {
      purchaseId,
      success: true,
      testMode: config.is_test_mode,
      formData: paymentParams as Record<string, string>
    };
    
    // Set a small timeout to ensure the result is returned before the form submits
    setTimeout(() => {
      form.submit();
    }, 100);
    
    return result;
  } catch (error: any) {
    console.error("Payment processing error:", error);
    toast.error("Payment processing error", {
      description: error.message || "Failed to process payment"
    });
    return {
      purchaseId: purchaseId,
      success: false,
      error: error.message || "Unknown payment error"
    };
  }
};

export const completePaymentTransaction = async (
  purchaseId: string, 
  paymentId: string, 
  paymentData = {}
) => {
  try {
    console.log(`Attempting to complete transaction for purchase ID: ${purchaseId}`);
    
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
