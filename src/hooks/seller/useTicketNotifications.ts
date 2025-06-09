
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[ticket-notifications] Starting notification process for seller ${sellerId}, ticket: ${ticketTitle}`);
      
      // Get seller information including verified status
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
      
      // Get all subscribers for this seller
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
      
      // Get buyer profiles for all subscribers
      const buyerIds = subscribers.map(sub => sub.buyer_id);
      const { data: buyerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', buyerIds);
      
      if (profilesError) {
        console.error('[ticket-notifications] Error fetching buyer profiles:', profilesError);
        throw profilesError;
      }
      
      // Get ticket details for the notification
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('description, is_free, price')
        .eq('id', ticketId)
        .single();
      
      const ticketDescription = ticketData?.description || 'Check out this new betting ticket!';
      const priceInfo = ticketData?.is_free ? 'Free ticket' : `R${ticketData?.price}`;
      
      // Create notifications for each subscriber
      let successCount = 0;
      let emailsSent = 0;
      
      const notificationPromises = subscribers.map(async (sub) => {
        try {
          const buyerProfile = buyerProfiles?.find(profile => profile.id === sub.buyer_id);
          const verifiedBadge = sellerData.verified ? ' ✓' : '';
          
          // Create in-app notification
          const notification = await createNotification(
            sub.buyer_id,
            `New ticket from ${sellerUsername}${verifiedBadge}`,
            `${ticketTitle} - ${priceInfo}`,
            'ticket',
            ticketId
          );
          
          if (notification) {
            successCount++;
            console.log(`[ticket-notifications] Notification created for buyer ${sub.buyer_id}`);
            
            // Send email notification if subscriber has email
            if (buyerProfile && buyerProfile.email) {
              try {
                console.log(`[ticket-notifications] Sending email to ${buyerProfile.email}`);
                const { error: emailError } = await supabase.functions.invoke('send-ticket-notification', {
                  body: {
                    buyerEmail: buyerProfile.email,
                    buyerUsername: buyerProfile.username || 'Subscriber',
                    sellerUsername: `${sellerUsername}${sellerData.verified ? ' ✓' : ''}`,
                    ticketTitle,
                    ticketId,
                    ticketDescription
                  }
                });
                
                if (!emailError) {
                  emailsSent++;
                  console.log(`[ticket-notifications] Email sent successfully to ${buyerProfile.email}`);
                } else {
                  console.error(`[ticket-notifications] Email error for ${buyerProfile.email}:`, emailError);
                }
              } catch (emailError) {
                console.error(`[ticket-notifications] Email failed for ${buyerProfile.email}:`, emailError);
              }
            }
            
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
      await Promise.all(notificationPromises);
      
      console.log(`[ticket-notifications] Successfully created ${successCount} notifications and sent ${emailsSent} emails out of ${subscribers.length} subscribers`);
      
      console.log('[ticket-notifications] Notification process completed successfully');
      toast.success(`Ticket created and ${successCount} subscribers notified! ${emailsSent} emails sent.`);
      return { 
        success: true, 
        count: successCount,
        emailCount: emailsSent,
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
