
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
  type: "subscription" | "ticket" | "system" | "free_ticket" | "case" | "admin_notification" | "seller_notification",
  relatedId?: string
): Promise<any | null> => {
  try {
    if (!userId) {
      console.error('[notification] Error creating notification: userId is required');
      return null;
    }

    // Log the creation attempt with details
    console.log(`[notification] Creating notification for user ${userId}: "${title}" (type: ${type})`);
    
    // Validate userId format to make debugging easier if there's an issue
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.error('[notification] Invalid userId format:', userId);
      return null;
    }
    
    const notificationData = {
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Try to insert the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
      
    if (error) {
      console.error('[notification] Error creating notification:', error);
      // Log the attempted data for debugging
      console.error('[notification] Failed notification data:', JSON.stringify(notificationData));
      return null;
    }
    
    console.log('[notification] Notification created successfully:', data);
    return data;
  } catch (error) {
    console.error('[notification] Exception when creating notification:', error);
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
      console.error('[notification-test] No authenticated user found');
      return false;
    }
    
    console.log('[notification-test] Testing notification creation for user:', user.id);
    
    // Try to create a test notification
    const result = await createNotification(
      user.id,
      'Test Notification',
      'This is a test notification to verify permissions.',
      'system'
    );
    
    return result !== null;
  } catch (error) {
    console.error('[notification-test] Error testing notification creation:', error);
    return false;
  }
};
