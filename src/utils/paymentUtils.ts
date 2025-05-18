
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
      
      // Create a default config with the provided credentials
      const defaultConfig = {
        merchant_id: '14452088',
        merchant_key: '3indglm6c7jzr',
        passphrase: 'AfrinetHash2025',
        is_test_mode: true
      };
      
      try {
        // First delete any existing settings to avoid conflicts
        await supabase
          .from("payment_settings")
          .delete()
          .not("id", "is", null);
          
        // Then insert new settings
        const { data: newConfig, error: insertError } = await supabase
          .from("payment_settings")
          .insert(defaultConfig)
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating default payment config:", insertError);
          console.log("Using hardcoded default config");
          return defaultConfig; // Use default even if insert fails
        }
        
        console.log("Created new payment config:", newConfig);
        return newConfig;
      } catch (innerError) {
        console.error("Error creating payment settings:", innerError);
        console.log("Using hardcoded default config");
        return defaultConfig;
      }
    }
    
    console.log("Payment config fetched:", data);
    return data as PayFastConfig;
  } catch (error: any) {
    console.error("Error fetching payment config:", error);
    
    // Return hardcoded default in case of any error
    console.log("Using hardcoded default config due to error");
    return {
      merchant_id: '14452088',
      merchant_key: '3indglm6c7jzr',
      passphrase: 'AfrinetHash2025',
      is_test_mode: true
    };
  }
};

export const generateSignature = (data: Record<string, string>, passphrase: string): string => {
  // For secure implementation, this should be done server-side
  // This is a client-side mock for development only
  const payload = Object.keys(data)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&') + `&passphrase=${encodeURIComponent(passphrase)}`;
  
  console.log("Signature payload:", payload);
  
  // Mock signature for development - in production this would be handled server-side with proper MD5 hashing
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

    // Add signature
    const signature = generateSignature(
      paymentParams as Record<string, string>, 
      config.passphrase
    );
    const finalParams = { ...paymentParams, signature };

    console.log("Final params with signature:", finalParams);
    
    // Build the form URL with query parameters
    const baseUrl = config.is_test_mode 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';
    
    // Properly encode all parameters for URL use
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
