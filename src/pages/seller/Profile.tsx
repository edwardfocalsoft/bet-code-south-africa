
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { useSellerProfileData } from "@/hooks/useSellerProfileData";
import ProfileSidebar from "@/components/seller/profile/ProfileSidebar";
import ProfileContent from "@/components/seller/profile/ProfileContent";
import ProfileLoading from "@/components/seller/profile/ProfileLoading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SellerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useIsMobile();
  
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

  const tabOptions = [
    { value: "profile", label: "Profile" },
    { value: "settings", label: "Settings" }
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === activeTab)?.label || "Profile";

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Profile</h1>
        
        {isMobile ? (
          <div className="space-y-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-betting-dark-gray border-betting-light-gray text-white hover:bg-betting-light-gray"
                >
                  {currentTabLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-full bg-betting-dark-gray border-betting-light-gray"
                align="start"
              >
                {tabOptions.map((tab) => (
                  <DropdownMenuItem
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="text-gray-300 hover:text-white hover:bg-betting-light-gray cursor-pointer"
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div>
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 gap-6">
                  <ProfileSidebar 
                    currentUser={currentUser}
                    profileData={{username: profileData.username, avatarUrl: profileData.avatarUrl}}
                    filePreview={filePreview}
                    handleFileChange={handleFileChange}
                    isUploading={uploading}
                    isSaving={isSaving}
                  />
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
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </Layout>
  );
};

export default SellerProfile;
