
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a notification for a user
 * @param userId The user ID to create the notification for
 * @param title The notification title
 * @param message The notification message
 * @param type The notification type (subscription, ticket, system, free_ticket, case)
 * @param relatedId Optional related entity ID
 * @returns The created notification or null if there was an error
 */
export const createNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  type: "subscription" | "ticket" | "system" | "free_ticket" | "case",
  relatedId?: string
): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception when creating notification:', error);
    return null;
  }
};
