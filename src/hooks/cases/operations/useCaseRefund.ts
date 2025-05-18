
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useCaseRefund = () => {
  const { currentUser, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = userRole === 'admin';

  // Process a refund
  const processRefund = async (
    caseId: string, 
    purchaseId: string, 
    buyerId: string, 
    sellerId: string, 
    amount: number
  ) => {
    if (!currentUser || !isAdmin) {
      toast.error("You don't have permission to process refunds");
      return false;
    }

    setIsLoading(true);

    try {
      // 1. Add credit to buyer using the add_credits RPC function
      const { data: buyerResult, error: buyerError } = await supabase
        .rpc('add_credits', { 
          user_id: buyerId, 
          amount_to_add: amount 
        });

      if (buyerError) throw buyerError;

      // 2. Deduct credit from seller using the add_credits RPC function
      const { data: sellerResult, error: sellerError } = await supabase
        .rpc('add_credits', { 
          user_id: sellerId, 
          amount_to_add: -amount 
        });

      if (sellerError) throw sellerError;

      // 3. Create wallet transaction for buyer
      const { error: buyerTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: buyerId,
          amount,
          type: 'refund',
          reference_id: purchaseId,
          description: 'Refund from case #' + caseId
        });

      if (buyerTxError) throw buyerTxError;

      // 4. Create wallet transaction for seller
      const { error: sellerTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: sellerId,
          amount: -amount,
          type: 'refund',
          reference_id: purchaseId,
          description: 'Refund deduction from case #' + caseId
        });

      if (sellerTxError) throw sellerTxError;

      // 5. Update case status to 'refunded'
      const { error: caseError } = await supabase
        .from('cases')
        .update({ 
          status: 'refunded', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (caseError) throw caseError;

      toast.success(`Refund processed successfully: R${amount.toFixed(2)}`);
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      return true;
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processRefund,
    isLoading
  };
};
