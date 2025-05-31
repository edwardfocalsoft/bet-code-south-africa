import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // Get seller information
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sellerId)
        .single();
      
      if (sellerError || !sellerData) {
        console.error('[ticket-notifications] Error fetching seller info:', sellerError);
        throw sellerError || new Error('Seller not found');
      }
      
      const sellerUsername = sellerData.username || 'A seller';
      
      // Get all subscribers
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
      
      // Get ticket details
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('description')
        .eq('id', ticketId)
        .single();
      
      const ticketDescription = ticketData?.description || 'Check out this new betting ticket!';
      
      // Prepare notifications
      const notificationsToInsert = subscribers.map(sub => ({
        user_id: sub.buyer_id,
        title: `${sellerUsername} has published a ticket`,
        message: ticketDescription,
        type: 'ticket',
        related_id: ticketId,
        is_read: false
      }));
      
      // Insert notifications
      const { data: insertedNotifications, error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)
        .select();
      
      if (insertError) {
        console.error('[ticket-notifications] Error inserting notifications:', insertError);
        throw insertError;
      }
      
      console.log(`[ticket-notifications] Successfully inserted ${insertedNotifications?.length || 0} notifications`);
      
      // Send email notifications
      try {
        const buyerIds = subscribers.map(sub => sub.buyer_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, username')
          .in('id', buyerIds);
        
        if (profilesError) {
          console.error('[ticket-notifications] Error fetching profiles for emails:', profilesError);
          throw profilesError;
        }
        
        if (profiles && profiles.length > 0) {
          const emailPromises = profiles.map(async (profile) => {
            if (!profile.email) return;
            
            try {
              console.log(`[ticket-notifications] Sending email to ${profile.email}`);
              const { error } = await supabase.functions.invoke('send-ticket-notification', {
                body: JSON.stringify({
                  buyerEmail: profile.email,
                  buyerUsername: profile.username || 'Subscriber',
                  sellerUsername,
                  ticketTitle,
                  ticketId,
                  ticketDescription
                })
              });
              
              if (error) {
                console.error(`[ticket-notifications] Email error for ${profile.email}:`, error);
                throw error;
              }
              return true;
            } catch (e) {
              console.error(`[ticket-notifications] Email failed for ${profile.email}:`, e);
              return false;
            }
          });
          
          await Promise.all(emailPromises);
          console.log('[ticket-notifications] Email notifications completed');
        }
      } catch (emailError) {
        console.error('[ticket-notifications] Error sending email notifications:', emailError);
        throw new Error(`Email notifications partially failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
      }
      
      console.log('[ticket-notifications] Notification process completed successfully');
      return { 
        success: true, 
        count: insertedNotifications?.length || 0,
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