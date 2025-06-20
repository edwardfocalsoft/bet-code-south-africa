
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
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Check for valid image MIME types
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validImageTypes.includes(file.type)) {
      toast.error("Invalid file type. Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Image must be less than 2MB");
      return;
    }

    try {
      toast.loading("Uploading profile picture...");
      
      // First, check if the profiles bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('[avatar-upload] Available buckets:', buckets);
      
      if (bucketsError) {
        console.error('[avatar-upload] Error listing buckets:', bucketsError);
        throw new Error(`Cannot access storage: ${bucketsError.message}`);
      }
      
      const profilesBucket = buckets?.find(bucket => bucket.id === 'profiles');
      if (!profilesBucket) {
        console.error('[avatar-upload] Profiles bucket not found');
        throw new Error('Storage bucket not configured. Please contact support.');
      }
      
      // Upload the file directly
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${userId}/${fileName}`;
      
      console.log(`[avatar-upload] Uploading to path: ${filePath}`);
      console.log(`[avatar-upload] File type: ${file.type}`);
      console.log(`[avatar-upload] File size: ${file.size} bytes`);
      console.log(`[avatar-upload] User ID: ${userId}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });
        
      if (uploadError) {
        console.error("[avatar-upload] Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('[avatar-upload] Upload data:', uploadData);
      
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;
      console.log(`[avatar-upload] Upload successful, public URL: ${newAvatarUrl}`);

      // Update the profile data with new avatar URL
      const updatedProfileData = {
        ...profileData,
        avatarUrl: newAvatarUrl
      };
      setProfileData(updatedProfileData);
      
      // Save the profile with new avatar URL
      await saveProfileData(updatedProfileData);
      
      // Refresh profile to ensure we have the latest data
      await refreshProfile();
      
      toast.dismiss();
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.dismiss();
      toast.error(`Error updating profile picture: ${error.message}`);
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
