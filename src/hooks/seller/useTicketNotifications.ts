import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTicketNotifications = () => {
  const notifySubscribersOfNewTicket = async (sellerId: string, ticketId: string, ticketTitle: string) => {
    try {
      // 1. Get seller info (same as manual notifications)
      const { data: seller } = await supabase
        .from('profiles')
        .select('username, verified')
        .eq('id', sellerId)
        .single();

      if (!seller) throw new Error("Seller not found");

      // 2. Get subscribers (identical to manual approach)
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('buyer_id')
        .eq('seller_id', sellerId);

      if (!subscriptions || subscriptions.length === 0) {
        return { success: true, notifiedCount: 0 };
      }

      // 3. Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('is_free, price')
        .eq('id', ticketId)
        .single();

      // 4. Create notifications (EXACTLY like manual notifications)
      const notifications = subscriptions.map(sub => ({
        user_id: sub.buyer_id,
        title: `New ticket from ${seller.username}${seller.verified ? ' ✓' : ''}`,
        message: `${ticketTitle} - ${ticket?.is_free ? 'Free' : `R${ticket?.price}`}`,
        type: 'ticket', // Only difference from manual
        related_id: ticketId,
        is_read: false
      }));

      // 5. Insert (identical to working manual version)
      const { error, count } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;

      toast.success(`Notified ${count} subscribers`);
      return { success: true, notifiedCount: count || 0 };

    } catch (error) {
      console.error("Notification error:", error);
      toast.error("Failed to notify subscribers");
      return { success: false, notifiedCount: 0 };
    }
  };

  return { notifySubscribersOfNewTicket };
};