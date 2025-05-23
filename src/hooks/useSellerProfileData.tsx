
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
    saveProfile
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
      // First handle avatar upload if a file is selected
      if (selectedFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          setProfileData(prev => ({
            ...prev,
            avatarUrl: newAvatarUrl
          }));
        }
      }
      
      // Then save the profile data
      await saveProfile(e);
      resetFileData();
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
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
    saveBankDetails,
  };
};
