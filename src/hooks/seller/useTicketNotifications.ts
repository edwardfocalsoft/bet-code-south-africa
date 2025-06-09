
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // 1. Get seller information
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username, verified')
        .eq('id', sellerId)
        .single();
      
      if (sellerError || !sellerData) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        throw sellerError || new Error('Seller not found');
      }
      
      const sellerUsername = sellerData.username || 'A seller';
      
      // 2. Get all subscribers for this seller
      const { data: subscribers, error: subscribersError, count: subscriberCount } = await supabase
        .from('subscriptions')
        .select('buyer_id', { count: 'exact' })
        .eq('seller_id', sellerId);
      
      if (subscribersError) {
        console.error('[ticket-notifications] Error fetching subscribers:', subscribersError);
        throw subscribersError;
      }
      
      if (!subscribers || subscribers.length === 0) {
        console.log('[ticket-notifications] No subscribers found for this seller');
        toast.success("Ticket created successfully! No subscribers to notify at this time.");
        return { success: true, count: 0, subscriberCount: 0 };
      }
      
      console.log(`[ticket-notifications] Found ${subscribers.length} subscribers`);
      
      // 3. Get ticket details
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('description, is_free, price')
        .eq('id', ticketId)
        .single();
      
      const ticketDescription = ticketData?.description || 'Check out this new betting ticket!';
      const priceInfo = ticketData?.is_free ? 'Free ticket' : `R${ticketData?.price}`;
      
      // 4. Create notifications directly (replacing createNotification)
      const notifications = subscribers.map(sub => ({
        user_id: sub.buyer_id,
        title: `New ticket from ${sellerUsername}${sellerData.verified ? ' ✓' : ''}`,
        message: `${ticketTitle} - ${priceInfo}`,
        type: 'ticket',
        related_id: ticketId,
        is_read: false,
        created_at: new Date().toISOString()
      }));
      
      // Batch insert notifications
      const { error: notificationError, count: successCount } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      if (notificationError) {
        console.error('[ticket-notifications] Error creating notifications:', notificationError);
        throw notificationError;
      }
      
      console.log(`[ticket-notifications] Successfully created ${successCount} notifications`);
      
      // 5. Send emails (optional)
      let emailsSent = 0;
      if (process.env.NODE_ENV === 'production') {
        // Get buyer profiles for email
        const buyerIds = subscribers.map(sub => sub.buyer_id);
        const { data: buyerProfiles } = await supabase
          .from('profiles')
          .select('id, email, username')
          .in('id', buyerIds);
        
        const emailPromises = buyerProfiles?.map(async profile => {
          try {
            const { error } = await supabase.functions.invoke('send-ticket-notification', {
              body: {
                buyerEmail: profile.email,
                buyerUsername: profile.username || 'Subscriber',
                sellerUsername: `${sellerUsername}${sellerData.verified ? ' ✓' : ''}`,
                ticketTitle,
                ticketId,
                ticketDescription
              }
            });
            if (!error) emailsSent++;
          } catch (e) {
            console.error(`Email failed for ${profile.email}`, e);
          }
        });
        
        await Promise.all(emailPromises || []);
      }
      
      console.log(`[ticket-notifications] Process completed. Notifications: ${successCount}, Emails: ${emailsSent}`);
      toast.success(`Ticket created and ${successCount} subscribers notified!`);
      
      return { 
        success: true, 
        count: successCount || 0,
        emailCount: emailsSent,
        subscriberCount: subscribers.length 
      };
      
    } catch (error) {
      console.error('[ticket-notifications] Error:', error);
      toast.error("Failed to notify subscribers");
      return { 
        success: false, 
        count: 0,
        emailCount: 0,
        subscriberCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  return { notifySubscribersOfNewTicket };
};
