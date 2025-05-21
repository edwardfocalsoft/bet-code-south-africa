
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
  type: "subscription" | "ticket" | "system" | "free_ticket" | "case" | "new_ticket",
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
 * Creates notifications for all subscribers when a seller posts a new ticket
 * @param sellerId The seller ID
 * @param ticketId The new ticket ID
 * @param ticketTitle The ticket title
 * @returns Number of notifications created
 */
export const notifySubscribersAboutNewTicket = async (
  sellerId: string,
  ticketId: string,
  ticketTitle: string,
  sellerName: string
): Promise<number> => {
  try {
    // Fetch all subscribers for this seller
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscriptions')
      .select('buyer_id')
      .eq('seller_id', sellerId);
    
    if (subscribersError) {
      console.error('[notification] Error fetching subscribers:', subscribersError);
      return 0;
    }
    
    if (!subscribers || subscribers.length === 0) {
      console.log(`[notification] No subscribers found for seller ${sellerId}`);
      return 0;
    }
    
    console.log(`[notification] Found ${subscribers.length} subscribers to notify about new ticket`);
    
    // Create a notification for each subscriber
    const notificationPromises = subscribers.map(sub => 
      createNotification(
        sub.buyer_id,
        `New Ticket from ${sellerName}`,
        `${sellerName} just posted a new ticket: ${ticketTitle}`,
        'new_ticket',
        ticketId
      )
    );
    
    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`[notification] Successfully notified ${successCount}/${subscribers.length} subscribers`);
    return successCount;
  } catch (error) {
    console.error('[notification] Error notifying subscribers:', error);
    return 0;
  }
};

/**
 * Notifies all admins about a new support case
 * @param caseId The case ID
 * @param caseTitle The case title
 * @param userName The user who created the case
 * @returns Number of notifications created
 */
export const notifyAdminsAboutNewCase = async (
  caseId: string,
  caseTitle: string,
  userName: string
): Promise<number> => {
  try {
    // Fetch all admins
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');
    
    if (adminsError) {
      console.error('[notification] Error fetching admins:', adminsError);
      return 0;
    }
    
    if (!admins || admins.length === 0) {
      console.log('[notification] No admins found to notify about new case');
      return 0;
    }
    
    console.log(`[notification] Found ${admins.length} admins to notify about new case`);
    
    // Create a notification for each admin
    const notificationPromises = admins.map(admin => 
      createNotification(
        admin.id,
        'New Support Case',
        `${userName} created a new support case: ${caseTitle}`,
        'case',
        caseId
      )
    );
    
    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`[notification] Successfully notified ${successCount}/${admins.length} admins about new case`);
    return successCount;
  } catch (error) {
    console.error('[notification] Error notifying admins about new case:', error);
    return 0;
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
