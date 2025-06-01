
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileData } from "@/types";

export const useSellerProfile = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    avatarUrl: "",
    displayWhatsapp: false,
    whatsappNumber: "",
  });

  const loadProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, display_whatsapp, whatsapp_number")
        .eq("id", userId)
        .maybeSingle();

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
      console.error("Error loading profile:", error);
      toast.error(`Error loading profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const updateData = { 
        username: profileData.username,
        avatar_url: profileData.avatarUrl,
        display_whatsapp: profileData.displayWhatsapp,
        whatsapp_number: profileData.displayWhatsapp ? profileData.whatsappNumber : null
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  return {
    isLoading,
    isSaving,
    profileData,
    setProfileData,
    saveProfile,
  };
};
