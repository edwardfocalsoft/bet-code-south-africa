
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
  status?: "pending" | "completed" | "cancelled"; // Add status field
};

export const useWallet = () => {
  const { currentUser } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { processTopUp } = usePayFast();
  const transactionsPerPage = 5;

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

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Update wallet top-up function to track cancelled payments
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
      
      // Use the Supabase function to create the transaction with correct parameter order
      const { data, error } = await supabase.rpc(
        "create_wallet_top_up" as any,
        {
          p_amount: amount,
          p_description: "Wallet top-up (pending)",
          p_user_id: currentUser.id
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
      
      // Store the transaction ID in sessionStorage for access after redirect
      sessionStorage.setItem('pendingTopUpId', transactionId);
      
      // Process the top-up using PayFast
      await processTopUp({
        amount: amount,
        transactionId: transactionId,
        cancelUrl: `${window.location.origin}/payment/cancel?transactionId=${transactionId}` // Pass transaction ID to cancel URL
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

  // Add a method to cancel pending transactions
  const cancelTransaction = async (transactionId: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Update the transaction status to cancelled
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ 
          description: "Wallet top-up (cancelled)"
        })
        .eq('id', transactionId)
        .eq('user_id', currentUser.id)
        .eq('type', 'topup');
      
      if (error) {
        console.error("Failed to cancel transaction:", error);
        return false;
      }
      
      toast.info("Payment was cancelled", {
        description: "Your wallet top-up was cancelled. No charges were made."
      });
      
      return true;
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    creditBalance: creditBalance ?? 0, 
    transactions, 
    currentTransactions,
    isLoading,
    error, 
    topUpWallet,
    cancelTransaction,
    currentPage,
    totalPages,
    setCurrentPage
  };
};
