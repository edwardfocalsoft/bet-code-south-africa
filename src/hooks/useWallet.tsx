
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { addCredits } from "@/utils/sqlFunctions";
import { usePayFast } from "./usePayFast";
import { PaymentResult } from "@/utils/paymentUtils";

// Define a transaction type for our wallet
export type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "topup" | "purchase" | "refund";
  description?: string;
  created_at: string;
  reference_id?: string;
};

export const useWallet = () => {
  const { currentUser } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initiatePayment } = usePayFast();

  // Fetch both credit balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!currentUser) {
        setCreditBalance(null);
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch credit balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credit_balance')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching credit balance:", profileError);
          setCreditBalance(null);
          setError(`Error fetching credit balance: ${profileError.message}`);
        } else {
          // Ensure the credit_balance is a number, default to 0 if undefined
          const balance = profileData?.credit_balance !== undefined && 
                         profileData?.credit_balance !== null ? 
                         Number(profileData.credit_balance) : 0;
          setCreditBalance(balance);
          console.log("Fetched credit balance:", balance);
        }
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
          setTransactions([]);
          setError(`Error fetching transactions: ${transactionsError.message}`);
        } else {
          // Cast the transaction types appropriately
          setTransactions(transactionsData?.map(transaction => ({
            ...transaction,
            type: transaction.type as "topup" | "purchase" | "refund"
          })) || []);
          console.log("Fetched transactions:", transactionsData?.length || 0);
        }
      } catch (error: any) {
        console.error("Exception in wallet hook:", error);
        setCreditBalance(null);
        setTransactions([]);
        setError(error.message || "Failed to load wallet data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
    
    // Set up a subscription to profile changes
    const profileSubscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${currentUser?.id}` 
      }, (payload) => {
        const newBalance = payload.new?.credit_balance;
        if (newBalance !== undefined) {
          setCreditBalance(Number(newBalance));
          console.log("Credit balance updated via subscription:", newBalance);
        }
      })
      .subscribe();
    
    // Set up a subscription to wallet transactions
    const transactionsSubscription = supabase
      .channel('transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${currentUser?.id}`
      }, () => {
        // Refetch transactions when there's a change
        console.log("Transaction change detected, refetching data");
        fetchWalletData();
      })
      .subscribe();
    
    return () => {
      profileSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
    };
  }, [currentUser]);

  // Add top up wallet function using PayFast
  const topUpWallet = async (amount: number): Promise<boolean> => {
    if (!currentUser) {
      const errorMessage = "You must be logged in to add credits";
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
    
    if (amount <= 0) {
      const errorMessage = "Amount must be greater than zero";
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting wallet top-up for amount:", amount);
      
      // Initialize a pending transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: currentUser.id,
          amount: amount,
          type: 'topup',
          description: 'Wallet top-up (pending)'
        })
        .select('id')
        .single();
      
      if (transactionError) {
        console.error("Failed to create transaction record:", transactionError);
        setError(`Database error: ${transactionError.message}`);
        throw transactionError;
      }
      
      console.log("Created transaction record:", transactionData);
      
      // Initiate payment via PayFast
      const paymentResult = await initiatePayment({
        ticketId: 'wallet-topup',
        ticketTitle: 'Wallet Credit Top-up',
        amount: amount,
        buyerId: currentUser.id,
        purchaseId: transactionData.id,
        useCredit: false // Don't use existing credit for top-ups
      });

      console.log("Payment initiation result:", paymentResult);
      
      if (!paymentResult) {
        const errorMessage = "Failed to initialize payment";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Form submission is handled by processPayment now
      return true;
    } catch (error: any) {
      console.error("Error adding credits:", error);
      const errorMessage = error.message || "An unexpected error occurred while processing your payment";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    creditBalance: creditBalance ?? 0, 
    transactions, 
    isLoading,
    error, 
    topUpWallet 
  };
};
