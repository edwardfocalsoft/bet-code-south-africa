
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for handling ticket-related notifications
 */
export const useTicketNotifications = () => {
  
  /**
   * Notify all subscribers when a seller publishes a new ticket
   * Uses the same logic as manual notifications
   */
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // Get seller information first
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sellerId)
        .single();
      
      if (sellerError) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        throw sellerError;
      }
      
      const sellerUsername = sellerData?.username || 'A seller';
      
      // Get all subscribers of this seller
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select('buyer_id')
        .eq('seller_id', sellerId);
      
      if (subscribersError) {
        console.error('[ticket-notifications] Error fetching subscribers:', subscribersError);
        throw subscribersError;
      }
      
      if (!subscribers || subscribers.length === 0) {
        console.log('[ticket-notifications] No subscribers found for this seller');
        return { success: true, count: 0, subscriberCount: 0 };
      }
      
      console.log(`[ticket-notifications] Found ${subscribers.length} subscribers for seller ${sellerUsername}`);
      
      // Get ticket details for description
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('description')
        .eq('id', ticketId)
        .single();
      
      if (ticketError) {
        console.error('[ticket-notifications] Error fetching ticket details:', ticketError);
        // Continue without description rather than failing
      }
      
      const ticketDescription = ticketData?.description || 'Check out this new betting ticket!';
      
      // Prepare notifications for batch insert - using same format as manual notifications
      const notificationsToInsert = subscribers.map((subscription: any) => ({
        user_id: subscription.buyer_id,
        title: `${sellerUsername} has published a ticket`,
        message: ticketDescription,
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
        // Get buyer profiles for email notifications
        const buyerIds = subscribers.map(sub => sub.buyer_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, username')
          .in('id', buyerIds);
        
        if (profilesError) {
          console.error('[ticket-notifications] Error fetching profiles for emails:', profilesError);
        } else if (profiles) {
          for (const profile of profiles) {
            if (profile.email) {
              console.log(`[ticket-notifications] Sending email notification to ${profile.email}`);
              const emailResponse = await supabase.functions.invoke('send-ticket-notification', {
                body: {
                  buyerEmail: profile.email,
                  buyerUsername: profile.username || 'Subscriber',
                  sellerUsername,
                  ticketTitle,
                  ticketId
                }
              });
              
              if (emailResponse.error) {
                console.error(`[ticket-notifications] Email function error for ${profile.email}:`, emailResponse.error);
              } else {
                console.log(`[ticket-notifications] Email notification sent successfully to ${profile.email}`);
              }
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
      
    } catch (error) {
      console.error('[ticket-notifications] Error in notifySubscribersOfNewTicket:', error);
      // Show user-friendly error message
      toast.error("Failed to notify subscribers", {
        description: "The ticket was created but some subscribers may not have been notified."
      });
      throw error;
    }
  };
  
  return {
    notifySubscribersOfNewTicket
  };
};
