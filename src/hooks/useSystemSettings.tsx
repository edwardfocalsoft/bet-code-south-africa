
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface SystemSettings {
  id?: string;
  min_withdrawal_amount: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export const useSystemSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    min_withdrawal_amount: 1000, // Default value
  });
  const { currentUser } = useAuth();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error("Error fetching system settings:", error);
      toast.error(`Failed to load system settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: Partial<SystemSettings>) => {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only admins can update system settings");
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = {
        ...newSettings,
        updated_at: new Date().toISOString(),
        updated_by: currentUser.id,
      };

      // Check if settings exist, if yes update, if not insert
      const { data: existingSettings } = await supabase
        .from("system_settings")
        .select("id")
        .maybeSingle();

      let result;
      
      if (existingSettings?.id) {
        // Update existing record
        result = await supabase
          .from("system_settings")
          .update(updatedSettings)
          .eq("id", existingSettings.id);
      } else {
        // Create new record
        result = await supabase
          .from("system_settings")
          .insert(updatedSettings);
      }

      if (result.error) throw result.error;
      
      toast.success("System settings updated successfully");
      
      // Refresh the settings
      fetchSettings();
    } catch (error: any) {
      console.error("Error saving system settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings
  };
};
