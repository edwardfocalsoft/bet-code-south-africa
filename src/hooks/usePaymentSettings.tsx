import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

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
  const { toast } = useToast();
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
      
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive",
      });
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
      
      setSettings(data);
      toast({
        title: "Settings Created",
        description: "Default payment settings have been created.",
      });
      
    } catch (error: any) {
      console.error("Error creating initial payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to create payment settings",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async (updatedSettings: Partial<PaymentSettings>) => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only admins can update payment settings",
        variant: "destructive",
      });
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

      // Otherwise update existing settings
      const { error } = await supabase
        .from("payment_settings")
        .update({
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Payment gateway settings have been updated successfully",
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
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
