import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationResult {
  success: boolean;
  notifiedCount: number;
  subscriberCount: number;
  error?: string;
}

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (
    sellerId: string,
    ticketId: string,
    ticketTitle: string
  ): Promise<NotificationResult> => {
    try {
      // 1. Get seller info
      const { data: seller, error: sellerError } = await supabase
        .from('profiles')
        .select('username, verified')
        .eq('id', sellerId)
        .single();

      if (sellerError || !seller) {
        throw sellerError || new Error('Seller not found');
      }

      // 2. Get active subscribers
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('buyer_id')
        .eq('seller_id', sellerId)
        .eq('status', 'active');

      if (subsError) throw subsError;

      const subscriberCount = subscriptions?.length || 0;
      if (subscriberCount === 0) {
        return { success: true, notifiedCount: 0, subscriberCount };
      }

      // 3. Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('is_free, price')
        .eq('id', ticketId)
        .single();

      // 4. Prepare notifications
      const notifications = subscriptions!.map(sub => ({
        user_id: sub.buyer_id,
        title: `New ticket from ${seller.username}${seller.verified ? ' ✓' : ''}`,
        message: `${ticketTitle} - ${ticket?.is_free ? 'Free' : `R${ticket?.price}`}`,
        type: 'ticket',
        related_id: ticketId,
        is_read: false,
        created_at: new Date().toISOString()
      }));

      // 5. Insert notifications
      const { error: notifyError, count } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notifyError) throw notifyError;

      const notifiedCount = count || 0;
      return { success: true, notifiedCount, subscriberCount };

    } catch (error) {
      console.error('Notification error:', error);
      return {
        success: false,
        notifiedCount: 0,
        subscriberCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return { notifySubscribersOfNewTicket };
};