
import { supabase } from "@/integrations/supabase/client";

/**
 * Execute the add_credits SQL function to update a user's credit balance
 * @param userId The user ID to update credits for
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns The updated balance or null if there was an error
 */
export const addCredits = async (userId: string, amount: number): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc(
      'add_credits', 
      { 
        user_id: userId, 
        amount_to_add: amount 
      }
    );
    
    if (error) {
      console.error('Error executing add_credits function:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception when executing add_credits function:', error);
    return null;
  }
};
