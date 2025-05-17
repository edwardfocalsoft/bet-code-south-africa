
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useWallet = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get user credit balance
  const { data: creditBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['credit-balance', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        console.error("Error fetching credit balance:", error);
        return 0;
      }
      
      return data?.credit_balance || 0;
    },
    enabled: !!currentUser,
  });

  // Get wallet transaction history
  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['wallet-transactions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching wallet transactions:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!currentUser,
  });

  // Simulate a top-up (in a real app, this would integrate with a payment gateway)
  const topUpWallet = async (amount: number) => {
    if (!currentUser) {
      toast.error("You must be logged in to top up your wallet");
      return;
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would be a payment gateway flow
      // For now, we'll just simulate a successful payment
      
      // 1. Create a wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: currentUser.id,
          amount,
          type: 'topup',
          description: 'Wallet top-up'
        });

      if (transactionError) throw transactionError;

      // 2. Update user's credit balance using custom SQL function
      const { data: updateResult, error: updateError } = await supabase
        .rpc('add_credits', { 
          user_id: currentUser.id, 
          amount_to_add: amount 
        });

      if (updateError) throw updateError;

      toast.success(`Successfully added R${amount.toFixed(2)} to your wallet`);
      
      // Refresh data
      refetchBalance();
      refetchTransactions();
      
      return true;
    } catch (error: any) {
      console.error("Error topping up wallet:", error);
      toast.error("Failed to top up wallet: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase using credit balance
  const purchaseWithCredits = async (ticketId: string, sellerId: string, price: number) => {
    if (!currentUser) {
      toast.error("You must be logged in to make a purchase");
      return false;
    }

    if (price > (creditBalance || 0)) {
      toast.error("Insufficient credit balance");
      return false;
    }

    setIsLoading(true);

    try {
      // 1. Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          buyer_id: currentUser.id,
          seller_id: sellerId,
          ticket_id: ticketId,
          price,
          is_rated: false
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 2. Create wallet transaction record for purchase
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: currentUser.id,
          amount: -price, // Negative amount for a purchase
          type: 'purchase',
          reference_id: purchase.id,
          description: 'Ticket purchase'
        });

      if (transactionError) throw transactionError;

      // 3. Update user's credit balance using custom SQL function
      const { data: updateResult, error: updateError } = await supabase
        .rpc('add_credits', { 
          user_id: currentUser.id, 
          amount_to_add: -price // Negative for deduction
        });

      if (updateError) throw updateError;

      toast.success("Purchase successful");
      
      // Refresh data
      refetchBalance();
      refetchTransactions();
      
      return true;
    } catch (error: any) {
      console.error("Error making purchase with credits:", error);
      toast.error("Failed to make purchase: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    creditBalance,
    transactions,
    isLoading,
    topUpWallet,
    purchaseWithCredits,
    refetchBalance,
    refetchTransactions
  };
};
