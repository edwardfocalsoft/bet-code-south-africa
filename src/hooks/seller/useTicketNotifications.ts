
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
      console.log(`[ticket-notifications] Notifying subscribers of seller ${sellerId} about new ticket: ${ticketTitle}`);
      
      // Get all subscribers of this seller
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select('buyer_id, profiles!subscriptions_buyer_id_fkey(email, username)')
        .eq('seller_id', sellerId);
      
      if (subscribersError) {
        console.error('[ticket-notifications] Error fetching subscribers:', subscribersError);
        return;
      }
      
      if (!subscribers || subscribers.length === 0) {
        console.log('[ticket-notifications] No subscribers found for this seller');
        return;
      }
      
      // Get seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sellerId)
        .single();
      
      if (sellerError) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        return;
      }
      
      const sellerUsername = sellerData?.username || 'Unknown Seller';
      
      // Create notifications for each subscriber
      const notificationPromises = subscribers.map(async (subscription: any) => {
        const buyerId = subscription.buyer_id;
        const buyerEmail = subscription.profiles?.email;
        const buyerUsername = subscription.profiles?.username;
        
        // Create in-app notification
        await createNotification(
          buyerId,
          'New Ticket Published',
          `${sellerUsername} has published a new ticket: "${ticketTitle}"`,
          'ticket',
          ticketId
        );
        
        // Send email notification via edge function
        if (buyerEmail) {
          try {
            await supabase.functions.invoke('send-ticket-notification', {
              body: {
                buyerEmail,
                buyerUsername: buyerUsername || 'Subscriber',
                sellerUsername,
                ticketTitle,
                ticketId
              }
            });
            console.log(`[ticket-notifications] Email notification sent to ${buyerEmail}`);
          } catch (emailError) {
            console.error(`[ticket-notifications] Error sending email to ${buyerEmail}:`, emailError);
          }
        }
      });
      
      await Promise.all(notificationPromises);
      console.log(`[ticket-notifications] Successfully notified ${subscribers.length} subscribers`);
      
    } catch (error) {
      console.error('[ticket-notifications] Error in notifySubscribersOfNewTicket:', error);
    }
  };
  
  return {
    notifySubscribersOfNewTicket
  };
};
