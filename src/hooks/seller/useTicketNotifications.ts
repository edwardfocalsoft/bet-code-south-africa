
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/utils/notificationUtils";

/**
 * Hook for handling ticket-related notifications
 */
export const useTicketNotifications = () => {
  
  /**
   * Notify all subscribers when a seller publishes a new ticket
   */
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // Get all subscribers of this seller
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select(`
          buyer_id,
          profiles!subscriptions_buyer_id_fkey(email, username)
        `)
        .eq('seller_id', sellerId);
      
      if (subscribersError) {
        console.error('[ticket-notifications] Error fetching subscribers:', subscribersError);
        throw subscribersError;
      }
      
      if (!subscribers || subscribers.length === 0) {
        console.log('[ticket-notifications] No subscribers found for this seller');
        return;
      }
      
      console.log(`[ticket-notifications] Found ${subscribers.length} subscribers for seller ${sellerId}`);
      
      // Get seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sellerId)
        .single();
      
      if (sellerError) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        throw sellerError;
      }
      
      const sellerUsername = sellerData?.username || 'Unknown Seller';
      console.log(`[ticket-notifications] Seller username: ${sellerUsername}`);
      
      // Create notifications for each subscriber
      const notificationPromises = subscribers.map(async (subscription: any) => {
        const buyerId = subscription.buyer_id;
        const buyerProfile = subscription.profiles;
        const buyerEmail = buyerProfile?.email;
        const buyerUsername = buyerProfile?.username;
        
        console.log(`[ticket-notifications] Processing subscriber: ${buyerUsername} (${buyerEmail}) - ID: ${buyerId}`);
        
        // Create in-app notification using direct database insert to ensure it's created
        try {
          console.log(`[ticket-notifications] Creating in-app notification for user ${buyerId}`);
          
          const { data: notification, error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: buyerId,
              title: 'New Ticket Published',
              message: `${sellerUsername} has published a new ticket: "${ticketTitle}"`,
              type: 'ticket',
              related_id: ticketId,
              is_read: false
            })
            .select()
            .single();
          
          if (notificationError) {
            console.error(`[ticket-notifications] Error creating notification for ${buyerUsername}:`, notificationError);
            throw notificationError;
          } else {
            console.log(`[ticket-notifications] In-app notification created successfully for ${buyerUsername}:`, notification.id);
          }
        } catch (notifError) {
          console.error(`[ticket-notifications] Error creating in-app notification for ${buyerUsername}:`, notifError);
          throw notifError;
        }
        
        // Send email notification via edge function
        if (buyerEmail) {
          try {
            console.log(`[ticket-notifications] Sending email notification to ${buyerEmail}`);
            const emailResponse = await supabase.functions.invoke('send-ticket-notification', {
              body: {
                buyerEmail,
                buyerUsername: buyerUsername || 'Subscriber',
                sellerUsername,
                ticketTitle,
                ticketId
              }
            });
            
            if (emailResponse.error) {
              console.error(`[ticket-notifications] Email function error for ${buyerEmail}:`, emailResponse.error);
            } else {
              console.log(`[ticket-notifications] Email notification sent successfully to ${buyerEmail}`, emailResponse.data);
            }
          } catch (emailError) {
            console.error(`[ticket-notifications] Error sending email to ${buyerEmail}:`, emailError);
          }
        } else {
          console.log(`[ticket-notifications] No email address found for subscriber ${buyerUsername}`);
        }
      });
      
      const results = await Promise.allSettled(notificationPromises);
      console.log(`[ticket-notifications] Completed notification process for ${subscribers.length} subscribers`);
      
      // Check results and report any failures
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          console.log(`[ticket-notifications] Successfully notified subscriber ${index + 1}`);
        } else {
          failureCount++;
          console.error(`[ticket-notifications] Failed to notify subscriber ${index + 1}:`, result.reason);
        }
      });
      
      console.log(`[ticket-notifications] Final results: ${successCount} successful, ${failureCount} failed out of ${subscribers.length} subscribers`);
      
    } catch (error) {
      console.error('[ticket-notifications] Error in notifySubscribersOfNewTicket:', error);
      throw error;
    }
  };
  
  return {
    notifySubscribersOfNewTicket
  };
};
