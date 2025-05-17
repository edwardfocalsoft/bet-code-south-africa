
import { supabase } from "@/integrations/supabase/client";

/**
 * Execute the add_credits SQL function to update a user's credit balance
 * @param userId The user ID to update credits for
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns The updated balance or null if there was an error
 */
export const addCredits = async (userId: string, amount: number): Promise<number | null> => {
  try {
    // Convert userId to string if it's not already (fixes the type error)
    const userIdStr = String(userId);
    
    const { data, error } = await supabase.rpc(
      'add_credits', 
      { 
        user_id: userIdStr, 
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

/**
 * Delete notifications older than 60 days for all users or a specific user
 * @param userId Optional user ID to delete notifications only for that user
 * @returns Number of deleted notifications or null if there was an error
 */
export const deleteOldNotifications = async (userId?: string): Promise<number | null> => {
  try {
    let query = supabase
      .from('notifications')
      .delete()
      .lt('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());
    
    // If userId is provided, only delete notifications for that user
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { error, count } = await query.select('id');
    
    if (error) {
      console.error('Error deleting old notifications:', error);
      return null;
    }
    
    return count;
  } catch (error) {
    console.error('Exception when deleting old notifications:', error);
    return null;
  }
};
