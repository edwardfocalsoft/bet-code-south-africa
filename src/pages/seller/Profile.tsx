
import React from "react";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useSellerProfileData } from "@/hooks/useSellerProfileData";
import ProfileSidebar from "@/components/seller/profile/ProfileSidebar";
import PersonalDetailsForm from "@/components/seller/profile/PersonalDetailsForm";
import BankDetailsForm from "@/components/seller/profile/BankDetailsForm";
import AccountVerificationCard from "@/components/seller/profile/AccountVerificationCard";

const SellerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  
  const {
    isLoading,
    isSaving,
    isSavingBank,
    uploading,
    profileData,
    setProfileData,
    bankDetails,
    setBankDetails,
    hasBankDetails,
    filePreview,
    handleFileChange,
    saveProfile,
    saveBankDetails,
  } = useSellerProfileData(currentUser?.id);

  if (isLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar 
              currentUser={currentUser}
              profileData={{username: profileData.username, avatarUrl: profileData.avatarUrl}}
              filePreview={filePreview}
              handleFileChange={handleFileChange}
              isUploading={uploading}
              isSaving={isSaving}
            />
          </div>
          
          <div className="md:col-span-2">
            <PersonalDetailsForm 
              profileData={{
                username: profileData.username,
                displayWhatsapp: profileData.displayWhatsapp,
                whatsappNumber: profileData.whatsappNumber
              }}
              setProfileData={setProfileData}
              isSaving={isSaving || uploading}
              onSubmit={saveProfile}
              currentUserEmail={currentUser?.email || ""}
            />
            
            <BankDetailsForm 
              bankDetails={bankDetails}
              setBankDetails={setBankDetails}
              hasBankDetails={hasBankDetails}
              isSaving={isSavingBank}
              onSubmit={saveBankDetails}
            />
            
            <AccountVerificationCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfile;
