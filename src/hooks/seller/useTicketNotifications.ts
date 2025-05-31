
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      
      // Get all subscribers of this seller with their profile information
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select(`
          buyer_id,
          profiles!subscriptions_buyer_id_fkey(email, username)
        `)
        .eq('seller_id', sellerId);
      
      if (subscribersError) {
        console.error('[ticket-notifications] Error fetching subscribers:', subscribersError);
        
        // Try alternative query approach if the foreign key reference fails
        const { data: alternativeSubscribers, error: altError } = await supabase
          .from('subscriptions')
          .select('buyer_id')
          .eq('seller_id', sellerId);
        
        if (altError) {
          console.error('[ticket-notifications] Alternative query also failed:', altError);
          throw altError;
        }
        
        if (!alternativeSubscribers || alternativeSubscribers.length === 0) {
          console.log('[ticket-notifications] No subscribers found for this seller');
          return { success: true, count: 0 };
        }
        
        // Get profile information separately
        const buyerIds = alternativeSubscribers.map(sub => sub.buyer_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, username')
          .in('id', buyerIds);
        
        if (profilesError) {
          console.error('[ticket-notifications] Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        // Combine the data
        const combinedSubscribers = alternativeSubscribers.map(sub => ({
          buyer_id: sub.buyer_id,
          profiles: profiles?.find(p => p.id === sub.buyer_id) || null
        }));
        
        return await processNotifications(combinedSubscribers, sellerId, ticketId, ticketTitle);
      }
      
      if (!subscribers || subscribers.length === 0) {
        console.log('[ticket-notifications] No subscribers found for this seller');
        return { success: true, count: 0 };
      }
      
      return await processNotifications(subscribers, sellerId, ticketId, ticketTitle);
      
    } catch (error) {
      console.error('[ticket-notifications] Error in notifySubscribersOfNewTicket:', error);
      // Show user-friendly error message
      toast.error("Failed to notify subscribers", {
        description: "The ticket was created but some subscribers may not have been notified."
      });
      throw error;
    }
  };
  
  /**
   * Process notifications for subscribers
   */
  const processNotifications = async (subscribers: any[], sellerId: string, ticketId: string, ticketTitle: string) => {
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
    
    // Prepare notifications for batch insert
    const notificationsToInsert = subscribers.map((subscription: any) => ({
      user_id: subscription.buyer_id,
      title: 'New Ticket Published',
      message: `${sellerUsername} has published a new ticket: "${ticketTitle}"`,
      type: 'ticket',
      related_id: ticketId,
      is_read: false
    }));
    
    console.log(`[ticket-notifications] Inserting ${notificationsToInsert.length} notifications`);
    
    // Batch insert notifications
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert)
      .select('id, user_id');
    
    if (insertError) {
      console.error('[ticket-notifications] Error inserting notifications:', insertError);
      throw insertError;
    }
    
    console.log(`[ticket-notifications] Successfully inserted ${insertedNotifications?.length || 0} notifications`);
    
    // Send email notifications via edge function (optional, won't block if it fails)
    try {
      for (const subscription of subscribers) {
        const buyerProfile = subscription.profiles;
        const buyerEmail = buyerProfile?.email;
        const buyerUsername = buyerProfile?.username;
        
        if (buyerEmail) {
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
            console.log(`[ticket-notifications] Email notification sent successfully to ${buyerEmail}`);
          }
        }
      }
    } catch (emailError) {
      console.error('[ticket-notifications] Error sending email notifications (non-blocking):', emailError);
      // Don't throw here as we don't want email failures to block the notification process
    }
    
    console.log(`[ticket-notifications] Notification process completed successfully for ${subscribers.length} subscribers`);
    
    return { 
      success: true, 
      count: insertedNotifications?.length || 0,
      subscriberCount: subscribers.length 
    };
  };
  
  return {
    notifySubscribersOfNewTicket
  };
};
