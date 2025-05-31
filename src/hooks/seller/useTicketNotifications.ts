
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // 1. Get seller information
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', sellerId)
        .single();
      
      if (sellerError || !sellerData) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        throw sellerError || new Error('Seller not found');
      }
      
      const sellerUsername = sellerData.username || 'A seller';
      
      // 2. Get all subscribers
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
      
      console.log(`[ticket-notifications] Found ${subscribers.length} subscribers`);
      
      // 3. Get ticket details
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('description')
        .eq('id', ticketId)
        .single();
      
      const ticketDescription = ticketData?.description || 'Check out this new betting ticket!';
      
      // 4. Prepare and insert notifications in chunks (to avoid hitting limits)
      const chunkSize = 100;
      const notificationChunks = [];
      const buyerIds = subscribers.map(sub => sub.buyer_id);
      
      for (let i = 0; i < subscribers.length; i += chunkSize) {
        const chunk = subscribers.slice(i, i + chunkSize);
        const notifications = chunk.map(sub => ({
          user_id: sub.buyer_id,
          title: `${sellerUsername} has published a ticket`,
          message: ticketDescription,
          type: 'ticket',
          related_id: ticketId,
          is_read: false
        }));
        
        notificationChunks.push(notifications);
      }
      
      let totalInserted = 0;
      for (const chunk of notificationChunks) {
        const { error: insertError, count } = await supabase
          .from('notifications')
          .insert(chunk)
          .select('id', { count: 'exact' });
        
        if (insertError) {
          console.error('[ticket-notifications] Error inserting notifications chunk:', insertError);
          throw insertError;
        }
        
        totalInserted += count || 0;
      }
      
      console.log(`[ticket-notifications] Successfully inserted ${totalInserted} notifications`);
      
      // 5. Send email notifications
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, username')
        .in('id', buyerIds);
      
      if (profiles) {
        const emailPromises = profiles.map(async (profile) => {
          if (!profile.email) return;
          
          try {
            console.log(`[ticket-notifications] Sending email to ${profile.email}`);
            const { error } = await supabase.functions.invoke('send-ticket-notification', {
              body: {
                buyerEmail: profile.email,
                buyerUsername: profile.username || 'Subscriber',
                sellerUsername: sellerUsername,
                ticketTitle: ticketTitle,
                ticketId: ticketId,
                ticketDescription: ticketDescription
              }
            });
            
            if (error) {
              console.error(`[ticket-notifications] Email error for ${profile.email}:`, error);
              return { success: false, email: profile.email };
            }
            return { success: true, email: profile.email };
          } catch (e) {
            console.error(`[ticket-notifications] Email failed for ${profile.email}:`, e);
            return { success: false, email: profile.email };
          }
        });
        
        const emailResults = await Promise.all(emailPromises);
        const failedEmails = emailResults.filter(r => !r.success);
        
        if (failedEmails.length > 0) {
          console.warn(`[ticket-notifications] Failed to send ${failedEmails.length} emails`);
        }
      }
      
      console.log('[ticket-notifications] Notification process completed');
      return { 
        success: true, 
        count: totalInserted,
        subscriberCount: subscribers.length 
      };
      
    } catch (error) {
      console.error('[ticket-notifications] Error:', error);
      toast.error("Notification Error", {
        description: error instanceof Error ? error.message : "Failed to notify some subscribers"
      });
      throw error;
    }
  };
  
  return { notifySubscribersOfNewTicket };
};
