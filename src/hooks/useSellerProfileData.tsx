
import { useSellerProfile } from "./seller/useSellerProfile";
import { useSellerBankDetails } from "./seller/useSellerBankDetails";
import { useProfileAvatar } from "./seller/useProfileAvatar";
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
    handleFileChange,
    uploadAvatar,
    resetFileData
  } = useProfileAvatar(userId);

  // Combined saveProfile function that handles avatar upload
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    try {
      let updatedProfileData = { ...profileData };
      
      // First handle avatar upload if a file is selected
      if (selectedFile) {
        toast.loading("Uploading profile picture...");
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          updatedProfileData = {
            ...updatedProfileData,
            avatarUrl: newAvatarUrl
          };
          setProfileData(updatedProfileData);
          toast.dismiss();
          toast.success("Profile picture uploaded successfully!");
        }
      }
      
      // Then save the profile data (including new avatar URL if uploaded)
      toast.loading("Updating profile...");
      await saveProfile(e);
      resetFileData();
      
      // Refresh profile to ensure we have the latest data
      await refreshProfile();
      
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
  const isSaving = isSavingProfile || uploading;

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
