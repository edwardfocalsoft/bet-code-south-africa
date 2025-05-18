
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
    if (!userId) {
      console.error('Error creating notification: userId is required');
      return null;
    }

    console.log(`Creating notification for user ${userId}: ${title}`);
    
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
    
    console.log('Notification created successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception when creating notification:', error);
    return null;
  }
};

/**
 * Function to test if the current user can create notifications - only for manual testing
 * THIS SHOULD NOT BE CALLED AUTOMATICALLY IN PRODUCTION
 * @returns Boolean indicating success/failure
 */
export const testNotificationCreation = async (): Promise<boolean> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    console.log('Testing notification creation for user:', user.id);
    
    // Try to create a test notification
    const result = await createNotification(
      user.id,
      'Test Notification',
      'This is a test notification to verify permissions.',
      'system'
    );
    
    return result !== null;
  } catch (error) {
    console.error('Error testing notification creation:', error);
    return false;
  }
};
