
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankDetails } from "@/types";

export const useSellerBankDetails = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    accountType: "checking",
  });
  const [hasBankDetails, setHasBankDetails] = useState(false);

  const loadBankDetails = async () => {
    if (!userId) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    
    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadBankDetails();
    }
  }, [userId]);

  return {
    isLoading,
    isSaving,
    bankDetails,
    setBankDetails,
    hasBankDetails,
    saveBankDetails,
  };
};
