
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  username: string;
  avatarUrl: string;
  displayWhatsapp: boolean;
  whatsappNumber: string;
}

interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

export const useSellerProfileData = (userId: string | undefined) => {
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    avatarUrl: "",
    displayWhatsapp: false,
    whatsappNumber: "",
  });
  
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    accountType: "checking",
  });
  
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [whatsappFieldsExist, setWhatsappFieldsExist] = useState(false);

  // Helper function to check if WhatsApp fields exist
  const checkWhatsAppFieldsExist = async (): Promise<boolean> => {
    try {
      // We'll use a direct query to check if the columns exist
      // Note: This is wrapped in a try-catch because it might fail if the user doesn't have permissions
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

  const loadBankDetails = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setBankDetails({
          accountHolder: data.account_holder,
          bankName: data.bank_name,
          accountNumber: data.account_number,
          branchCode: data.branch_code,
          accountType: data.account_type,
        });
        setHasBankDetails(true);
      }
    } catch (error: any) {
      console.error("Error loading bank details:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        uiToast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile || !userId) return null;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, selectedFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      uiToast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    try {
      let avatarUrl = profileData.avatarUrl;
      
      if (selectedFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Create update object with required fields
      const updateData: Record<string, any> = { 
        username: profileData.username,
        avatar_url: avatarUrl,
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
        const whatsappUpdateData = {
          display_whatsapp: profileData.displayWhatsapp,
          whatsapp_number: profileData.displayWhatsapp ? profileData.whatsappNumber : null
        };
        
        const { error: whatsappError } = await supabase
          .from("profiles")
          .update(whatsappUpdateData)
          .eq("id", userId);
          
        if (whatsappError) {
          console.log("Error updating WhatsApp fields:", whatsappError);
        }
      }
      
      setProfileData(prev => ({
        ...prev,
        avatarUrl
      }));
      
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    // Basic validation
    if (!bankDetails.accountHolder || !bankDetails.bankName || 
        !bankDetails.accountNumber || !bankDetails.branchCode) {
      toast.error("Please fill in all bank details");
      return;
    }
    
    setIsSavingBank(true);
    try {
      if (hasBankDetails) {
        // Update existing bank details
        const { error } = await supabase
          .from("bank_details")
          .update({ 
            account_holder: bankDetails.accountHolder,
            bank_name: bankDetails.bankName,
            account_number: bankDetails.accountNumber,
            branch_code: bankDetails.branchCode,
            account_type: bankDetails.accountType,
          })
          .eq("user_id", userId);
        
        if (error) throw error;
      } else {
        // Create new bank details
        const { error } = await supabase
          .from("bank_details")
          .insert({ 
            user_id: userId,
            account_holder: bankDetails.accountHolder,
            bank_name: bankDetails.bankName,
            account_number: bankDetails.accountNumber,
            branch_code: bankDetails.branchCode,
            account_type: bankDetails.accountType,
          });
        
        if (error) throw error;
        setHasBankDetails(true);
      }
      
      toast.success("Bank details saved successfully");
    } catch (error: any) {
      toast.error(`Error saving bank details: ${error.message}`);
    } finally {
      setIsSavingBank(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadBankDetails();
    }
  }, [userId]);

  return {
    isLoading,
    isSaving,
    isSavingBank,
    uploading,
    profileData,
    setProfileData,
    bankDetails,
    setBankDetails,
    hasBankDetails,
    selectedFile,
    filePreview,
    handleFileChange,
    saveProfile,
    saveBankDetails,
  };
};
