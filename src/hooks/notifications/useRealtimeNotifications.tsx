
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Notification } from "@/types";

export function useRealtimeNotifications(
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void,
  setUnreadCount: (updater: (count: number) => number) => void
) {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Set up a realtime subscription to listen for new notifications
  useEffect(() => {
    if (!currentUser) {
      console.log("[realtime-notifications] No current user, not setting up realtime subscription");
      return;
    }
    
    console.log(`[realtime-notifications] Setting up subscription for user ${currentUser.id}`);
    
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        }, 
        (payload) => {
          console.log('[realtime-notifications] Received new notification:', payload);
          
          try {
            const newNotification = {
              id: payload.new.id,
              userId: payload.new.user_id,
              title: payload.new.title,
              message: payload.new.message,
              isRead: payload.new.is_read,
              createdAt: new Date(payload.new.created_at),
              type: payload.new.type,
              relatedId: payload.new.related_id,
            };
            
            // Add to state
            setNotifications((prev) => [newNotification, ...prev]);
            
            if (!newNotification.isRead) {
              setUnreadCount((count) => count + 1);
            }
            
            // Show a toast for the new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
            
            console.log('[realtime-notifications] Successfully processed new notification');
          } catch (error) {
            console.error('[realtime-notifications] Error processing notification payload:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[realtime-notifications] Subscription status: ${status}`);
      });

    return () => {
      console.log('[realtime-notifications] Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [currentUser, toast, setNotifications, setUnreadCount]);
}
