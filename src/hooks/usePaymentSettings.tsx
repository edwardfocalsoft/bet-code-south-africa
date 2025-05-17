
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
        .single();

      if (error) throw error;
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

  const updateSettings = async (updatedSettings: Partial<PaymentSettings>) => {
    if (!isAdmin || !settings?.id) {
      toast({
        title: "Permission Denied",
        description: "Only admins can update payment settings",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
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
