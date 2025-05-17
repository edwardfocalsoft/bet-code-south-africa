
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { useSellerProfileData } from "@/hooks/useSellerProfileData";
import ProfileSidebar from "@/components/seller/profile/ProfileSidebar";
import ProfileContent from "@/components/seller/profile/ProfileContent";
import ProfileLoading from "@/components/seller/profile/ProfileLoading";

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
          <ProfileLoading />
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
            <ProfileContent 
              currentUserEmail={currentUser?.email || ""}
              profileData={profileData}
              setProfileData={setProfileData}
              bankDetails={bankDetails}
              setBankDetails={setBankDetails}
              hasBankDetails={hasBankDetails}
              isSaving={isSaving}
              isSavingBank={isSavingBank}
              uploading={uploading}
              saveProfile={saveProfile}
              saveBankDetails={saveBankDetails}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfile;
