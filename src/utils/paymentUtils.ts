
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

    // Build the PayFast URL - use production URL since is_test_mode is false
    const baseUrl = 'https://www.payfast.co.za/eng/process';
    
    // Transform the params into form data
    const formData = new FormData();
    Object.entries(paymentParams).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // Create URL with query parameters for direct redirection
    const queryParams = new URLSearchParams();
    Object.entries(paymentParams).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    const paymentUrl = `${baseUrl}?${queryParams.toString()}`;
    console.log("Generated payment URL:", paymentUrl);
    
    return {
      purchaseId,
      success: true,
      testMode: config.is_test_mode,
      paymentUrl,
      formData: paymentParams as Record<string, string>
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    throw error;
  }
};

export const completePaymentTransaction = async (
  purchaseId: string, 
  paymentId: string, 
  paymentData = {}
) => {
  try {
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
  } catch (error) {
    console.error("Payment completion error:", error);
    throw error;
  }
};
