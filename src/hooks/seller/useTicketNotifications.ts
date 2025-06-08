
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

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
        toast.success("Ticket created successfully! No subscribers to notify at this time.");
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
      
      // Create notifications for each subscriber using the utility function
      let successCount = 0;
      const notificationPromises = subscribers.map(async (sub) => {
        try {
          const notification = await createNotification(
            sub.buyer_id,
            `${sellerUsername} published a new ticket`,
            `New ticket: ${ticketTitle}`,
            'ticket',
            ticketId
          );
          
          if (notification) {
            successCount++;
            return true;
          } else {
            console.error(`[ticket-notifications] Failed to create notification for buyer ${sub.buyer_id}`);
            return false;
          }
        } catch (error) {
          console.error(`[ticket-notifications] Error creating notification for buyer ${sub.buyer_id}:`, error);
          return false;
        }
      });
      
      // Wait for all notifications to be created
      const results = await Promise.all(notificationPromises);
      
      console.log(`[ticket-notifications] Successfully created ${successCount} notifications out of ${subscribers.length} subscribers`);
      
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
                body: {
                  buyerEmail: profile.email,
                  buyerUsername: profile.username || 'Subscriber',
                  sellerUsername,
                  ticketTitle,
                  ticketId,
                  ticketDescription
                }
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
        // Don't throw here - we still want to show success for the ticket creation
        console.log('[ticket-notifications] Continuing despite email notification errors');
      }
      
      console.log('[ticket-notifications] Notification process completed successfully');
      toast.success(`Ticket created and ${successCount} subscribers notified!`);
      return { 
        success: true, 
        count: successCount,
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
