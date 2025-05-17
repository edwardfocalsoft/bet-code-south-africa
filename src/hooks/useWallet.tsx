
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useWallet = () => {
  const { currentUser } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (!currentUser) {
        setCreditBalance(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('credit_balance')
          .eq('id', currentUser.id)
          .single();
        
        if (error) {
          console.error("Error fetching credit balance:", error);
          setCreditBalance(null);
        } else {
          // Ensure the credit_balance is a number, default to 0 if undefined
          const balance = data?.credit_balance !== undefined && 
                         data?.credit_balance !== null ? 
                         Number(data.credit_balance) : 0;
          setCreditBalance(balance);
        }
      } catch (error) {
        console.error("Exception in wallet hook:", error);
        setCreditBalance(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreditBalance();
    
    // Set up a subscription to profile changes
    const subscription = supabase
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
    
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  return { creditBalance, loading };
};
