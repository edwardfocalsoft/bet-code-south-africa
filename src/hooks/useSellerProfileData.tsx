
import { useSellerProfile } from "./seller/useSellerProfile";
import { useSellerBankDetails } from "./seller/useSellerBankDetails";
import { useProfileAvatar } from "./seller/useProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSellerProfileData = (userId: string | undefined) => {
  const {
    isLoading: isLoadingProfile,
    isSaving: isSavingProfile,
    profileData,
    setProfileData,
    saveProfile,
    refreshProfile
  } = useSellerProfile(userId);
  
  const {
    isLoading: isLoadingBankDetails,
    isSaving: isSavingBankDetails,
    bankDetails,
    setBankDetails,
    hasBankDetails,
    saveBankDetails
  } = useSellerBankDetails(userId);
  
  const {
    uploading,
    selectedFile,
    filePreview,
    handleFileChange: originalHandleFileChange,
    uploadAvatar,
    resetFileData
  } = useProfileAvatar(userId);

  // Enhanced file change handler that automatically uploads and saves
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // First handle the file selection
    originalHandleFileChange(e);
    
    const file = e.target.files?.[0];
    if (file && userId) {
      try {
        toast.loading("Uploading profile picture...");
        
        // Upload the avatar
        const newAvatarUrl = await uploadAvatar();
        
        if (newAvatarUrl) {
          // Update the profile data with new avatar URL
          const updatedProfileData = {
            ...profileData,
            avatarUrl: newAvatarUrl
          };
          setProfileData(updatedProfileData);
          
          // Save the profile with new avatar URL
          await saveProfileData(updatedProfileData);
          
          // Reset file data since upload is complete
          resetFileData();
          
          // Refresh profile to ensure we have the latest data
          await refreshProfile();
          
          toast.dismiss();
          toast.success("Profile picture updated successfully!");
        }
      } catch (error: any) {
        toast.dismiss();
        toast.error(`Error updating profile picture: ${error.message}`);
        // Reset file data on error
        resetFileData();
      }
    }
  };

  // Helper function to save profile data
  const saveProfileData = async (dataToSave: typeof profileData) => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: dataToSave.username,
        avatar_url: dataToSave.avatarUrl,
        display_whatsapp: dataToSave.displayWhatsapp,
        whatsapp_number: dataToSave.whatsappNumber,
      })
      .eq("id", userId);

    if (error) throw error;
  };

  // Regular saveProfile function that handles profile details only
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    try {
      toast.loading("Updating profile...");
      await saveProfile(e);
      toast.dismiss();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Error updating profile: ${error.message}`);
    }
  };

  // Enhanced saveBankDetails with success message
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    try {
      toast.loading("Updating bank details...");
      await saveBankDetails(e);
      toast.dismiss();
      toast.success("Bank details updated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Error updating bank details: ${error.message}`);
    }
  };

  const isLoading = isLoadingProfile || isLoadingBankDetails;
  const isSaving = isSavingProfile;

  return {
    isLoading,
    isSaving,
    isSavingBank: isSavingBankDetails,
    uploading,
    profileData,
    setProfileData,
    bankDetails,
    setBankDetails,
    hasBankDetails,
    selectedFile,
    filePreview,
    handleFileChange,
    saveProfile: handleSaveProfile,
    saveBankDetails: handleSaveBankDetails,
  };
};
