
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branchCode: string;
}

export const useSellerBankDetails = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolder: "",
    bankName: "",
    accountType: "Savings",
    accountNumber: "",
    branchCode: "",
  });

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
          accountHolder: data.account_holder || "",
          bankName: data.bank_name || "",
          accountType: data.account_type || "Savings",
          accountNumber: data.account_number || "",
          branchCode: data.branch_code || "",
        });
        setHasBankDetails(true);
      } else {
        setHasBankDetails(false);
      }
    } catch (error: any) {
      console.error("Error loading bank details:", error);
      toast.error(`Error loading bank details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const bankData = {
        user_id: userId,
        account_holder: bankDetails.accountHolder,
        bank_name: bankDetails.bankName,
        account_type: bankDetails.accountType,
        account_number: bankDetails.accountNumber,
        branch_code: bankDetails.branchCode,
      };

      if (hasBankDetails) {
        const { error } = await supabase
          .from("bank_details")
          .update(bankData)
          .eq("user_id", userId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bank_details")
          .insert(bankData);
          
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
