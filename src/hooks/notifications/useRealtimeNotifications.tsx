
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";

export function useRealtimeNotifications(
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void,
  setUnreadCount: (updater: (count: number) => number) => void
) {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Set up a realtime subscription to listen for new notifications
  useEffect(() => {
    if (!currentUser) return;
    
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser, toast, setNotifications, setUnreadCount]);
}
