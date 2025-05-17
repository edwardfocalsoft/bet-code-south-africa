
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
  const [whatsappFieldsExist, setWhatsappFieldsExist] = useState(false);

  // Helper function to check if WhatsApp fields exist
  const checkWhatsAppFieldsExist = async (): Promise<boolean> => {
    try {
      // We'll use a direct query to check if the columns exist
      const { data, error } = await supabase
        .from("profiles")
        .select("display_whatsapp, whatsapp_number")
        .limit(1);
      
      // If the query didn't error out, the fields exist
      return !error;
    } catch {
      return false;
    }
  };

  const loadProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // First fetch basic profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          username: data.username || "",
          avatarUrl: data.avatar_url || "",
          displayWhatsapp: false,
          whatsappNumber: "",
        });
        
        // Check if WhatsApp fields exist
        const fieldsExist = await checkWhatsAppFieldsExist();
        setWhatsappFieldsExist(fieldsExist);
        
        // Then try to fetch WhatsApp fields separately if they exist
        if (fieldsExist) {
          try {
            const { data: whatsAppData } = await supabase
              .from("profiles")
              .select("*") // Select all columns to avoid specific column errors
              .eq("id", userId)
              .maybeSingle();
              
            if (whatsAppData) {
              // Access fields safely with type assertion since TS doesn't know these fields yet
              setProfileData(prev => ({
                ...prev,
                displayWhatsapp: !!(whatsAppData as any).display_whatsapp,
                whatsappNumber: (whatsAppData as any).whatsapp_number || "",
              }));
            }
          } catch (whatsAppError) {
            console.log("Error fetching WhatsApp fields:", whatsAppError);
          }
        }
      }
    } catch (error: any) {
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
      // Create update object with required fields
      const updateData: Record<string, any> = { 
        username: profileData.username,
        avatar_url: profileData.avatarUrl,
      };
      
      // First update the basic profile fields that we know exist
      const { error: basicUpdateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
        
      if (basicUpdateError) throw basicUpdateError;
      
      // Then try to update WhatsApp fields separately if they exist
      if (whatsappFieldsExist) {
        // Since we confirmed the fields exist, we can update them directly
        // We need to use a type assertion to bypass TypeScript's strict checking
        const { error: whatsappError } = await supabase
          .from("profiles")
          .update({
            // Use "as any" to bypass type checking since these fields exist at runtime but not in the TypeScript definition
            display_whatsapp: profileData.displayWhatsapp,
            whatsapp_number: profileData.displayWhatsapp ? profileData.whatsappNumber : null
          } as any)
          .eq("id", userId);
          
        if (whatsappError) {
          console.log("Error updating WhatsApp fields:", whatsappError);
        }
      }
      
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
