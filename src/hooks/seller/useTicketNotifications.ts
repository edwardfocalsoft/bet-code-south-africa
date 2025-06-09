import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      console.log(`[Notifications] Starting notification process for ticket ${ticketId}`);

      // 1. Verify seller exists
      const { data: seller, error: sellerError } = await supabase
        .from('profiles')
        .select('username, verified')
        .eq('id', sellerId)
        .single();

      if (sellerError || !seller) {
        console.error('[Notifications] Seller error:', sellerError?.message || 'Seller not found');
        throw new Error(sellerError?.message || 'Seller not found');
      }

      // 2. Get all active subscribers
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('buyer_id')
        .eq('seller_id', sellerId)
        .eq('status', 'active'); // Added status filter if you have one

      if (subsError) {
        console.error('[Notifications] Subscriptions error:', subsError.message);
        throw subsError;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('[Notifications] No active subscribers found');
        return { success: true, notifiedCount: 0 };
      }

      console.log(`[Notifications] Found ${subscriptions.length} subscribers`);

      // 3. Get ticket details
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('is_free, price, description')
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticket) {
        console.error('[Notifications] Ticket error:', ticketError?.message || 'Ticket not found');
        throw new Error(ticketError?.message || 'Ticket not found');
      }

      // 4. Prepare notifications (identical to manual notification logic)
      const notifications = subscriptions.map(sub => ({
        user_id: sub.buyer_id,
        title: `New ticket from ${seller.username}${seller.verified ? ' ✓' : ''}`,
        message: `${ticketTitle} - ${ticket.is_free ? 'Free' : `R${ticket.price}`}`,
        type: 'ticket',
        related_id: ticketId,
        is_read: false,
        created_at: new Date().toISOString()
      }));

      // 5. Batch insert notifications
      const { error: notifyError, count } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notifyError) {
        console.error('[Notifications] Insert error:', notifyError.message);
        throw notifyError;
      }

      const notifiedCount = count || 0;
      console.log(`[Notifications] Successfully notified ${notifiedCount} subscribers`);
      
      toast.success(`Ticket created! Notified ${notifiedCount} subscribers`);
      return { success: true, notifiedCount };

    } catch (error) {
      console.error('[Notifications] System error:', error);
      toast.error("Failed to notify subscribers");
      return { 
        success: false, 
        notifiedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  return { notifySubscribersOfNewTicket };
};