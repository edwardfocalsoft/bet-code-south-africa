
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { usePayFast } from "./usePayFast";

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
  const { processTopUp } = usePayFast();

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
      
      // Use the Supabase function to create the transaction
      // The parameter names and order MUST match the database function definition
      const { data, error } = await supabase.rpc(
        "create_wallet_top_up",
        {
          p_user_id: currentUser.id,
          p_amount: amount,
          p_description: "Wallet top-up (pending)"
        }
      );
      
      if (error) {
        console.error("Failed to create transaction record:", error);
        setError(`Database error: ${error.message}`);
        throw error;
      }
      
      // Cast the returned data to string to ensure it's treated as a transaction ID
      const transactionId = String(data);
      console.log("Created transaction record:", transactionId);
      
      // Process the top-up using PayFast
      await processTopUp({
        amount: amount,
        transactionId: transactionId,
      });

      // If execution reaches here, it means the form submission didn't redirect
      // This should only happen if there was an error
      return false;
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
