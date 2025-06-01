
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useCaseRefund = () => {
  const { currentUser, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = userRole === 'admin';

  // Process refund for a case
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
    console.log(`[case-refund] Starting refund process for case ${caseId}, purchase ${purchaseId}, amount: ${amount}`);

    try {
      // Update purchase status to refunded
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({ 
          payment_status: 'refunded',
          refunded_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (purchaseError) {
        console.error("[case-refund] Error updating purchase:", purchaseError);
        throw purchaseError;
      }

      // Add refund amount back to buyer's balance using raw SQL string
      const { error: buyerBalanceError } = await supabase.rpc('add_credits', {
        user_id: buyerId,
        amount_to_add: amount
      });

      if (buyerBalanceError) {
        console.error("[case-refund] Error updating buyer balance:", buyerBalanceError);
        throw buyerBalanceError;
      }

      // Deduct refund amount from seller's balance using raw SQL string  
      const { error: sellerBalanceError } = await supabase.rpc('add_credits', {
        user_id: sellerId,
        amount_to_add: -amount
      });

      if (sellerBalanceError) {
        console.error("[case-refund] Error updating seller balance:", sellerBalanceError);
        throw sellerBalanceError;
      }

      // Create refund transaction records
      await supabase
        .from('wallet_transactions')
        .insert([
          {
            user_id: buyerId,
            amount: amount,
            type: 'refund',
            description: 'Ticket purchase refund',
            reference_id: purchaseId
          },
          {
            user_id: sellerId,
            amount: -amount,
            type: 'refund',
            description: 'Ticket sale refund',
            reference_id: purchaseId
          }
        ]);

      // Update case status to resolved
      const { error: caseError } = await supabase
        .from('cases')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (caseError) {
        console.error("[case-refund] Error updating case status:", caseError);
        throw caseError;
      }

      console.log(`[case-refund] Refund processed successfully for case ${caseId}`);
      toast.success(`Refund of R${amount.toFixed(2)} processed successfully!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      // Notify buyer about refund using "case" type instead of "refund"
      try {
        console.log(`[case-refund] Creating refund notification for buyer ${buyerId}`);
        
        const notifResult = await createNotification(
          buyerId,
          "Refund Processed",
          `Your refund of R${amount.toFixed(2)} has been processed and added to your wallet.`,
          "case",
          caseId
        );
        
        console.log(`[case-refund] Buyer notification created:`, notifResult ? "Success" : "Failed");
      } catch (notifError) {
        console.error("[case-refund] Failed to create refund notification:", notifError);
        // Don't throw here - we want the refund to succeed even if notification fails
      }
      
      return true;
    } catch (error: any) {
      console.error("[case-refund] Error in refund process:", error);
      toast.error("Failed to process refund: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
      console.log(`[case-refund] Refund process completed for case ${caseId}`);
    }
  };

  return {
    processRefund,
    isLoading
  };
};
