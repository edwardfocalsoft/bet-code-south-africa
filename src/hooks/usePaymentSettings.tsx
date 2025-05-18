import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface PaymentSettings {
  id: string;
  merchant_id: string;
  merchant_key: string;
  passphrase: string;
  is_test_mode: boolean;
  updated_at: string;
}

export const usePaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log("Fetching payment settings...");
      
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        // If no settings exist, we should create a default one
        if (error.code === 'PGRST116') {
          console.log("No payment settings found, creating default");
          
          // Use the provided merchant credentials
          const defaultSettings = {
            merchant_id: "14452088",
            merchant_key: "3indglm6c7jzr",
            passphrase: "AfrinetHash2025",
            is_test_mode: true,
            updated_at: new Date().toISOString()
          };
          
          await createInitialSettings(defaultSettings);
          return;
        }
        throw error;
      }
      
      console.log("Payment settings loaded:", data);
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching payment settings:", error);
      toast.error("Failed to load payment settings");
      
      // If we hit any error, try to create default settings
      try {
        const defaultSettings = {
          merchant_id: "14452088",
          merchant_key: "3indglm6c7jzr",
          passphrase: "AfrinetHash2025",
          is_test_mode: true,
          updated_at: new Date().toISOString()
        };
        await createInitialSettings(defaultSettings);
      } catch (innerError) {
        console.error("Failed to create default settings:", innerError);
      }
    } finally {
      setLoading(false);
    }
  };

  const createInitialSettings = async (initialSettings: Omit<PaymentSettings, 'id'>) => {
    try {
      console.log("Creating initial payment settings:", initialSettings);
      
      // First try to delete any existing settings to avoid conflicts
      await supabase
        .from("payment_settings")
        .delete()
        .not("id", "is", null);
      
      // Then insert the new settings
      const { data, error } = await supabase
        .from("payment_settings")
        .insert(initialSettings)
        .select()
        .single();

      if (error) throw error;
      
      console.log("Settings created:", data);
      setSettings(data);
      toast.success("Payment settings have been configured");
      
    } catch (error: any) {
      console.error("Error creating initial payment settings:", error);
      toast.error("Failed to create payment settings");
    }
  };

  const updateSettings = async (updatedSettings: Partial<PaymentSettings>) => {
    if (!isAdmin) {
      toast.error("Only admins can update payment settings");
      return false;
    }

    try {
      setLoading(true);
      console.log("Updating payment settings:", updatedSettings);

      // If we don't have existing settings yet, create them
      if (!settings?.id) {
        const initialSettings = {
          merchant_id: updatedSettings.merchant_id || "14452088",
          merchant_key: updatedSettings.merchant_key || "3indglm6c7jzr",
          passphrase: updatedSettings.passphrase || "AfrinetHash2025",
          is_test_mode: updatedSettings.is_test_mode !== undefined ? updatedSettings.is_test_mode : true,
          updated_at: new Date().toISOString()
        };
        
        // First try to delete any existing settings to avoid conflicts
        await supabase
          .from("payment_settings")
          .delete()
          .not("id", "is", null);
        
        // Then create new settings
        await createInitialSettings(initialSettings);
        return true;
      }

      // Otherwise update existing settings
      console.log("Updating existing settings with ID:", settings.id);
      
      const { error } = await supabase
        .from("payment_settings")
        .update({
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (error) {
        console.error("Error in update:", error);
        throw error;
      }

      // Fetch the updated settings
      toast.success("Payment settings updated successfully");
      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      toast.error(error.message || "Failed to update payment settings");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings
  };
};
