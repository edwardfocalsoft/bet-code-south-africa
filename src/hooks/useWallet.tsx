
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { addCredits } from "@/utils/sqlFunctions";

// Define a transaction type for our wallet
type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "topup" | "purchase" | "refund";
  description?: string;
  created_at: string;
};

export const useWallet = () => {
  const { currentUser } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch both credit balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!currentUser) {
        setCreditBalance(null);
        setTransactions([]);
        setLoading(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setIsLoading(true);
        
        // Fetch credit balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credit_balance')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching credit balance:", profileError);
          setCreditBalance(null);
        } else {
          // Ensure the credit_balance is a number, default to 0 if undefined
          const balance = profileData?.credit_balance !== undefined && 
                         profileData?.credit_balance !== null ? 
                         Number(profileData.credit_balance) : 0;
          setCreditBalance(balance);
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
        } else {
          setTransactions(transactionsData || []);
        }
      } catch (error) {
        console.error("Exception in wallet hook:", error);
        setCreditBalance(null);
        setTransactions([]);
      } finally {
        setLoading(false);
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
        fetchWalletData();
      })
      .subscribe();
    
    return () => {
      profileSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
    };
  }, [currentUser]);

  // Add top up wallet function
  const topUpWallet = async (amount: number) => {
    if (!currentUser) {
      toast.error("You must be logged in to add credits");
      return false;
    }
    
    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Use the addCredits utility function to update the balance
      const newBalance = await addCredits(currentUser.id, amount);
      
      if (newBalance === null) {
        toast.error("Failed to add credits to your wallet");
        return false;
      }
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: currentUser.id,
          amount: amount,
          type: 'topup',
          description: 'Wallet top-up'
        });
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        // The balance was already updated, so still consider this a success
      }
      
      setCreditBalance(newBalance);
      toast.success(`R${amount.toFixed(2)} added to your wallet`);
      return true;
    } catch (error) {
      console.error("Error adding credits:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    creditBalance: creditBalance ?? 0, 
    loading, 
    transactions, 
    isLoading, 
    topUpWallet 
  };
};
