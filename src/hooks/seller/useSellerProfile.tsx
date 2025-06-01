
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileData } from "@/types";

export const useSellerProfile = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    avatarUrl: "",
    displayWhatsapp: false,
    whatsappNumber: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, display_whatsapp, whatsapp_number")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          username: data.username || "",
          avatarUrl: data.avatar_url || "",
          displayWhatsapp: data.display_whatsapp || false,
          whatsappNumber: data.whatsapp_number || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profileData.username,
          avatar_url: profileData.avatarUrl,
          display_whatsapp: profileData.displayWhatsapp,
          whatsapp_number: profileData.whatsappNumber,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    profileData,
    setProfileData,
    saveProfile,
    refreshProfile: fetchProfile,
  };
};
