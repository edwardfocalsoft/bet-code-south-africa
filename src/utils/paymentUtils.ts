
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
    console.log("Fetching payment config");
    const { data, error } = await supabase
      .from("payment_settings")
      .select("merchant_id, merchant_key, passphrase, is_test_mode")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching payment config:", error);
      
      // Create a default config if none exists
      const defaultConfig = {
        merchant_id: '14452088',
        merchant_key: '3indglm6c7jzr',
        passphrase: 'AfrinetHash2025',
        is_test_mode: true
      };
      
      const { data: newConfig, error: insertError } = await supabase
        .from("payment_settings")
        .insert(defaultConfig)
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating default payment config:", insertError);
        return defaultConfig; // Use default even if insert fails
      }
      
      console.log("Created new payment config:", newConfig);
      return newConfig;
    }
    
    console.log("Payment config fetched:", data);
    return data as PayFastConfig;
  } catch (error: any) {
    console.error("Error fetching payment config:", error);
    throw new Error("No payment configuration found");
  }
};

export const generateSignature = (data: Record<string, string>, passphrase: string): string => {
  // In production, this would need to be done server-side for security
  // This is a client-side mock implementation for development
  const payload = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&') + `&passphrase=${passphrase}`;
  
  console.log("Signature payload:", payload);
  // Mock signature for development - this should be replaced with a proper server-side implementation
  return "DEMO_SIGNATURE_" + Math.random().toString(36).substring(2, 15);
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

    // Add signature
    const signature = generateSignature(
      paymentParams as Record<string, string>, 
      config.passphrase
    );
    const finalParams = { ...paymentParams, signature };

    console.log("Processing payment with params:", finalParams);
    
    // Build the form URL with query parameters
    const baseUrl = config.is_test_mode 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';
    
    const queryString = Object.entries(finalParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    const formUrl = `${baseUrl}?${queryString}`;
    
    console.log("PayFast URL created:", formUrl);
    
    return {
      purchaseId,
      success: true,
      testMode: config.is_test_mode,
      paymentUrl: formUrl,
      formData: finalParams
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
