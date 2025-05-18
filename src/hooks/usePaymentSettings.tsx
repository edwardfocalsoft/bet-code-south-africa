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
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        // If no settings exist, we should create a default one
        if (error.code === 'PGRST116') {
          console.log("No payment settings found, creating default");
          const defaultSettings = {
            merchant_id: "10000100",
            merchant_key: "pb8iz6kkctyzm",
            passphrase: "TestPayFastPassphrase",
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
    } finally {
      setLoading(false);
    }
  };

  const createInitialSettings = async (initialSettings: Omit<PaymentSettings, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .insert(initialSettings)
        .select()
        .single();

      if (error) throw error;
      
      console.log("Settings created:", data);
      setSettings(data);
      toast.success("Default payment settings have been created");
      
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

      // If we don't have existing settings yet, create them
      if (!settings?.id) {
        const initialSettings = {
          merchant_id: updatedSettings.merchant_id || "10000100",
          merchant_key: updatedSettings.merchant_key || "pb8iz6kkctyzm",
          passphrase: updatedSettings.passphrase || "TestPayFastPassphrase",
          is_test_mode: updatedSettings.is_test_mode !== undefined ? updatedSettings.is_test_mode : true,
          updated_at: new Date().toISOString()
        };
        
        await createInitialSettings(initialSettings);
        return true;
      }

      console.log("Updating settings:", updatedSettings);

      // Otherwise update existing settings
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
