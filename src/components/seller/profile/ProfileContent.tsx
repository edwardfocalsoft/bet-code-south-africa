
import React from "react";
import PersonalDetailsForm from "@/components/seller/profile/PersonalDetailsForm";
import BankDetailsForm from "@/components/seller/profile/BankDetailsForm";
import AccountVerificationCard from "@/components/seller/profile/AccountVerificationCard";

interface ProfileContentProps {
  currentUserEmail: string;
  profileData: any;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  bankDetails: any;
  setBankDetails: React.Dispatch<React.SetStateAction<any>>;
  hasBankDetails: boolean;
  isSaving: boolean;
  isSavingBank: boolean;
  uploading: boolean;
  saveProfile: (e: React.FormEvent) => Promise<void>;
  saveBankDetails: (e: React.FormEvent) => Promise<void>;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  currentUserEmail,
  profileData,
  setProfileData,
  bankDetails,
  setBankDetails,
  hasBankDetails,
  isSaving,
  isSavingBank,
  uploading,
  saveProfile,
  saveBankDetails
}) => {
  return (
    <>
      <PersonalDetailsForm 
        profileData={{
          username: profileData.username,
          displayWhatsapp: profileData.displayWhatsapp,
          whatsappNumber: profileData.whatsappNumber
        }}
        setProfileData={setProfileData}
        isSaving={isSaving || uploading}
        onSubmit={saveProfile}
        currentUserEmail={currentUserEmail}
      />
      
      <BankDetailsForm 
        bankDetails={bankDetails}
        setBankDetails={setBankDetails}
        hasBankDetails={hasBankDetails}
        isSaving={isSavingBank}
        onSubmit={saveBankDetails}
      />
      
      <AccountVerificationCard />
    </>
  );
};

export default ProfileContent;
