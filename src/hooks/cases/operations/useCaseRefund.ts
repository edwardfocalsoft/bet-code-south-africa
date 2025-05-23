
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCaseRefund = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processRefund = async (
    caseId: string,
    purchaseId: string,
    buyerId: string,
    sellerId: string,
    amount: number
  ) => {
    setIsLoading(true);
    
    try {
      // 1. First update the case status to resolved
      const { error: caseError } = await supabase
        .from("cases")
        .update({
          status: "resolved",
          updated_at: new Date().toISOString()
        })
        .eq("id", caseId);

      if (caseError) throw caseError;

      // 2. Create a refund transaction for the buyer (credit)
      const { error: buyerTransactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: buyerId,
          amount: amount, // Positive amount (credit)
          type: "refund",
          description: "Ticket refund from resolved case",
          reference_id: purchaseId
        });

      if (buyerTransactionError) throw buyerTransactionError;

      // 3. Create a deduction transaction for the seller (debit)
      const { error: sellerTransactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: sellerId,
          amount: -amount, // Negative amount (debit)
          type: "refund",
          description: "Ticket refund deduction from resolved case",
          reference_id: purchaseId
        });

      if (sellerTransactionError) throw sellerTransactionError;

      // 4. Update buyer's credit balance
      const { error: buyerBalanceError } = await supabase.rpc(
        "add_credits", 
        { 
          user_id: buyerId, 
          amount_to_add: amount 
        }
      );

      if (buyerBalanceError) throw buyerBalanceError;

      // 5. Update seller's credit balance
      const { error: sellerBalanceError } = await supabase.rpc(
        "add_credits", 
        { 
          user_id: sellerId, 
          amount_to_add: -amount // Negative to deduct
        }
      );

      if (sellerBalanceError) throw sellerBalanceError;

      toast.success("Refund processed successfully");
      return true;
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast.error(`Failed to process refund: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { processRefund, isLoading };
};
